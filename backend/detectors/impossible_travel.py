from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from backend.scoring.threat_score import severity
from backend.mitre.mitre_mapper import get_mitre
from backend.models.alert import Alert
from backend.parser.log_parser import parse_log_timestamp
from backend.detectors.geoip_helper import resolve_ip_location, haversine_distance_km


class ImpossibleTravelDetector:
    """
    Detects Impossible Travel (Geographic Anomaly):
    Flags when two authentication events for the same user occur from locations
    where the implied travel speed exceeds plausible commercial air travel (e.g. > 900 km/h).
    """
    MAX_PLAUSIBLE_SPEED_KMH: float = 900.0  # Plausible maximum speed threshold in km/h
    MIN_DISTANCE_KM: float = 150.0          # Minimum geographic separation in km to avoid jitter

    def __init__(self, max_speed_kmh: float = 900.0, min_distance_km: float = 150.0):
        self.max_speed_kmh = max_speed_kmh or self.MAX_PLAUSIBLE_SPEED_KMH
        self.min_distance_km = min_distance_km or self.MIN_DISTANCE_KM

    def detect(self, logs: List[Dict[str, Any]]) -> List[Alert]:
        alerts = []
        if not logs:
            return alerts

        # Group auth events by user account
        events_by_user: Dict[str, List[Dict[str, Any]]] = {}

        for log in logs:
            user = str(log.get("user") or log.get("username") or "").strip()
            ip = log.get("ip") or log.get("source_ip")
            if not user or not ip or user.lower() in ["unknown", "none", "-", "anonymous", "network", "system", ""]:
                continue

            # Check if event was successful or authenticating
            status = str(log.get("status", "")).lower()
            if status in ["failed", "fail", "blocked", "deny", "invalid", "rejected"]:
                # Primary impossible travel evaluates successful logins, but repeated logins from distant locations are also tracked
                pass

            if user not in events_by_user:
                events_by_user[user] = []
            events_by_user[user].append(log)

        for user, events in events_by_user.items():
            # Resolve timestamps and geographic coordinates for each event
            parsed_entries = []
            for e in events:
                ip = e.get("ip") or e.get("source_ip")
                dt = e.get("datetime") or parse_log_timestamp(e.get("timestamp"))

                # Check if coordinates explicitly provided in log
                lat = e.get("latitude") or e.get("lat")
                lon = e.get("longitude") or e.get("lon")
                city = e.get("city") or "Unknown"
                country = e.get("country") or "External"

                if lat is None or lon is None:
                    loc = resolve_ip_location(ip)
                    if loc:
                        lat, lon, city, country = loc

                if lat is not None and lon is not None:
                    parsed_entries.append({
                        "dt": dt,
                        "ip": ip,
                        "lat": float(lat),
                        "lon": float(lon),
                        "city": city,
                        "country": country,
                        "destination": e.get("destination") or "auth.internal.corp",
                        "destination_ip": e.get("destination_ip") or "10.0.0.1",
                        "status": e.get("status", "Success"),
                        "raw": e.get("raw")
                    })

            # Impossible travel requires at least 2 distinct location entries
            if len(parsed_entries) < 2:
                continue

            # Sort chronologically by timestamp
            valid_time_entries = [p for p in parsed_entries if p["dt"] is not None]
            if len(valid_time_entries) >= 2:
                valid_time_entries.sort(key=lambda x: x["dt"])

                # Compare consecutive events for the same user
                for i in range(len(valid_time_entries) - 1):
                    e1 = valid_time_entries[i]
                    e2 = valid_time_entries[i + 1]

                    # If IP addresses are identical, speed is 0 (same location)
                    if e1["ip"] == e2["ip"]:
                        continue

                    dist_km = haversine_distance_km(e1["lat"], e1["lon"], e2["lat"], e2["lon"])
                    if dist_km < self.min_distance_km:
                        continue

                    time_delta_seconds = abs((e2["dt"] - e1["dt"]).total_seconds())
                    # Prevent division by zero: if timestamps are identical or within 10 seconds across distinct continents
                    effective_seconds = max(10.0, time_delta_seconds)
                    time_delta_hours = effective_seconds / 3600.0
                    speed_kmh = dist_km / time_delta_hours

                    if speed_kmh > self.max_speed_kmh:
                        # Real computed threat score based on speed excess, distance, and time delta
                        speed_excess_ratio = speed_kmh / self.max_speed_kmh  # e.g., 2.0x, 10.0x
                        base_score = 75.0
                        speed_bonus = min(20.0, (speed_excess_ratio - 1.0) * 4.0)
                        distance_bonus = min(5.0, (dist_km / 5000.0) * 5.0)

                        computed_score = int(min(100, max(65, round(base_score + speed_bonus + distance_bonus))))
                        sev = severity(computed_score)
                        mitre_data = get_mitre("Impossible Travel")

                        loc1_str = f"{e1['city']}, {e1['country']} ({e1['ip']})"
                        loc2_str = f"{e2['city']}, {e2['country']} ({e2['ip']})"
                        mins_str = f"{int(time_delta_seconds // 60)}m" if time_delta_seconds >= 60 else f"{int(time_delta_seconds)}s"

                        rule_desc = (
                            f"Impossible Travel: {user} accessed from {loc1_str} and {loc2_str} "
                            f"({int(dist_km)} km in {mins_str} = {int(speed_kmh):,} km/h, max plausible: {int(self.max_speed_kmh)} km/h)"
                        )

                        confidence = round(min(99.0, 85.0 + min(14.0, speed_excess_ratio * 2.0)), 1)

                        alerts.append(
                            Alert(
                                attack="Impossible Travel",
                                ip=e2["ip"],
                                destination_ip=e2["destination_ip"],
                                failed_attempts=2,
                                threat_score=computed_score,
                                severity=sev,
                                mitre=mitre_data,
                                user=user,
                                destination=e2["destination"],
                                host=e2["destination"],
                                rule_name=rule_desc,
                                confidence=confidence
                            )
                        )
            else:
                # Sequential fallback when timestamps are absent: check if 2 different external GeoIP locations occur consecutively
                unique_locs = []
                for p in parsed_entries:
                    if not unique_locs or unique_locs[-1]["ip"] != p["ip"]:
                        unique_locs.append(p)

                if len(unique_locs) >= 2:
                    e1 = unique_locs[0]
                    e2 = unique_locs[1]
                    dist_km = haversine_distance_km(e1["lat"], e1["lon"], e2["lat"], e2["lon"])
                    if dist_km >= self.min_distance_km:
                        computed_score = 75
                        sev = severity(computed_score)
                        mitre_data = get_mitre("Impossible Travel")
                        loc1_str = f"{e1['city']}, {e1['country']} ({e1['ip']})"
                        loc2_str = f"{e2['city']}, {e2['country']} ({e2['ip']})"

                        alerts.append(
                            Alert(
                                attack="Impossible Travel",
                                ip=e2["ip"],
                                destination_ip=e2["destination_ip"],
                                failed_attempts=2,
                                threat_score=computed_score,
                                severity=sev,
                                mitre=mitre_data,
                                user=user,
                                destination=e2["destination"],
                                host=e2["destination"],
                                rule_name=f"Sequential Geographic Shift: {user} moved {int(dist_km)} km between {loc1_str} and {loc2_str}",
                                confidence=82.0
                            )
                        )

        return alerts
