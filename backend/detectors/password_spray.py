from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Set
from backend.scoring.threat_score import severity
from backend.mitre.mitre_mapper import get_mitre
from backend.models.alert import Alert
from backend.parser.log_parser import parse_log_timestamp


class PasswordSprayDetector:
    """
    Detects Password Spraying attacks:
    Flags a single source IP attempting authentication against many DISTINCT usernames
    within a short rolling time window (configurable via constants).
    """
    THRESHOLD: int = 3            # Minimum distinct usernames targeted
    WINDOW_SECONDS: int = 300     # Rolling time window in seconds (5 minutes)

    def __init__(self, threshold: int = 3, window_seconds: int = 300):
        self.threshold = threshold or self.THRESHOLD
        self.window_seconds = window_seconds or self.WINDOW_SECONDS

    def detect(self, logs: List[Dict[str, Any]]) -> List[Alert]:
        alerts = []
        if not logs:
            return alerts

        failed_events_by_ip: Dict[str, List[Dict[str, Any]]] = {}

        for log in logs:
            status = str(log.get("status", "")).lower()
            if status not in ["failed", "fail", "blocked", "deny", "invalid", "rejected", "unauthorized"]:
                continue

            ip = log.get("ip") or log.get("source_ip")
            user = str(log.get("user") or log.get("username") or "").strip()
            if not ip or not user or user.lower() in ["unknown", "none", "-", "anonymous", ""]:
                continue

            if ip not in failed_events_by_ip:
                failed_events_by_ip[ip] = []
            failed_events_by_ip[ip].append(log)

        for ip, events in failed_events_by_ip.items():
            parsed_entries = []
            for e in events:
                dt = e.get("datetime") or parse_log_timestamp(e.get("timestamp"))
                user = str(e.get("user") or e.get("username") or "unknown").strip()
                dest = e.get("destination") or e.get("host") or "auth.internal.corp"
                dest_ip = e.get("destination_ip") or e.get("dst_ip") or "10.0.0.1"

                parsed_entries.append({
                    "dt": dt,
                    "user": user,
                    "destination": dest,
                    "destination_ip": dest_ip,
                    "raw": e.get("raw")
                })

            has_timestamps = any(item["dt"] is not None for item in parsed_entries)

            if has_timestamps:
                valid_entries = [p for p in parsed_entries if p["dt"] is not None]
                valid_entries.sort(key=lambda x: x["dt"])

                max_distinct_users: Set[str] = set()
                total_attempts_in_max_window = 0
                last_event: Optional[Dict[str, Any]] = None
                window_duration_actual = 0.0

                left = 0
                for right in range(len(valid_entries)):
                    t_right = valid_entries[right]["dt"]
                    while left <= right and (t_right - valid_entries[left]["dt"]).total_seconds() > self.window_seconds:
                        left += 1

                    window_users = {valid_entries[i]["user"] for i in range(left, right + 1)}
                    if len(window_users) > len(max_distinct_users):
                        max_distinct_users = window_users
                        total_attempts_in_max_window = right - left + 1
                        last_event = valid_entries[right]
                        window_duration_actual = max(1.0, (t_right - valid_entries[left]["dt"]).total_seconds())

                distinct_count = len(max_distinct_users)
                if distinct_count >= self.threshold:
                    # Real threat score calculation
                    base_score = 60.0
                    excess_users = distinct_count - self.threshold
                    user_multiplier = min(25.0, excess_users * 6.0)
                    volume_bonus = min(15.0, (total_attempts_in_max_window / max(1, distinct_count)) * 3.0)

                    computed_score = int(min(100, max(55, round(base_score + user_multiplier + volume_bonus))))
                    sev = severity(computed_score)
                    mitre_data = get_mitre("Password Spray")
                    confidence = round(min(98.0, 82.0 + excess_users * 3.0), 1)

                    sample_users_str = ", ".join(list(max_distinct_users)[:3])
                    if len(max_distinct_users) > 3:
                        sample_users_str += f" (+{len(max_distinct_users) - 3} more)"

                    alerts.append(
                        Alert(
                            attack="Password Spray",
                            ip=ip,
                            destination_ip=last_event["destination_ip"] if last_event else "10.0.0.1",
                            failed_attempts=total_attempts_in_max_window,
                            threat_score=computed_score,
                            severity=sev,
                            mitre=mitre_data,
                            user=f"{distinct_count} users: {sample_users_str}",
                            destination=last_event["destination"] if last_event else "auth.internal.corp",
                            host=last_event["destination"] if last_event else "server-01.corp.internal",
                            rule_name=f"Rolling Window Password Spray ({distinct_count} distinct users in {int(window_duration_actual)}s)",
                            confidence=confidence
                        )
                    )
            else:
                all_users = {p["user"] for p in parsed_entries}
                distinct_count = len(all_users)
                if distinct_count >= self.threshold:
                    excess = distinct_count - self.threshold
                    computed_score = int(min(100, max(55, 60 + excess * 6)))
                    sev = severity(computed_score)
                    mitre_data = get_mitre("Password Spray")
                    sample_users_str = ", ".join(list(all_users)[:3])
                    if len(all_users) > 3:
                        sample_users_str += f" (+{len(all_users) - 3} more)"

                    alerts.append(
                        Alert(
                            attack="Password Spray",
                            ip=ip,
                            destination_ip=parsed_entries[-1]["destination_ip"] if parsed_entries else "10.0.0.1",
                            failed_attempts=len(parsed_entries),
                            threat_score=computed_score,
                            severity=sev,
                            mitre=mitre_data,
                            user=f"{distinct_count} users: {sample_users_str}",
                            destination=parsed_entries[-1]["destination"] if parsed_entries else "auth.internal.corp",
                            host=parsed_entries[-1]["destination"] if parsed_entries else "server-01.corp.internal",
                            rule_name=f"Sequential Password Spray ({distinct_count} targeted accounts)",
                            confidence=min(92.0, 78.0 + excess * 3.0)
                        )
                    )

        return alerts
