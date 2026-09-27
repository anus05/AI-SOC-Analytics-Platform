from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from backend.scoring.threat_score import severity
from backend.mitre.mitre_mapper import get_mitre
from backend.models.alert import Alert
from backend.parser.log_parser import parse_log_timestamp

SENSITIVE_ACCOUNTS = {
    "root", "administrator", "admin", "system", "postgres", "sa",
    "oracle", "master", "service_account", "deploy", "ssh_user"
}


class BruteForceDetector:
    """
    Detects brute force authentication attacks:
    Flags a source IP (or source IP + username) with N or more failed attempts
    within a rolling time window (configurable via constants).
    """
    THRESHOLD: int = 5            # Minimum failed attempts to trigger alert
    WINDOW_SECONDS: int = 120     # Rolling time window in seconds (2 minutes)

    def __init__(self, threshold: int = 5, window_seconds: int = 120):
        self.threshold = threshold or self.THRESHOLD
        self.window_seconds = window_seconds or self.WINDOW_SECONDS

    def detect(self, logs: List[Dict[str, Any]]) -> List[Alert]:
        alerts = []
        if not logs:
            return alerts

        # Group failed authentication events by source IP
        failed_events_by_ip: Dict[str, List[Dict[str, Any]]] = {}

        for log in logs:
            status = str(log.get("status", "")).lower()
            if status not in ["failed", "fail", "blocked", "deny", "invalid", "rejected", "unauthorized"]:
                continue

            ip = log.get("ip") or log.get("source_ip")
            if not ip or ip in ("127.0.0.1", "::1", "localhost"):
                # Private/loopback allowed if specifically analyzing internal attacks, but check ip presence
                if not ip:
                    continue

            if ip not in failed_events_by_ip:
                failed_events_by_ip[ip] = []
            failed_events_by_ip[ip].append(log)

        for ip, events in failed_events_by_ip.items():
            # Parse timestamps and normalize entries
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
                    "port": int(e.get("port") or 22),
                    "raw": e.get("raw")
                })

            has_timestamps = any(item["dt"] is not None for item in parsed_entries)

            if has_timestamps:
                # Filter valid datetime entries and sort chronologically
                valid_entries = [p for p in parsed_entries if p["dt"] is not None]
                valid_entries.sort(key=lambda x: x["dt"])

                # Rolling sliding window algorithm
                max_window_count = 0
                max_window_users: List[str] = []
                last_event: Optional[Dict[str, Any]] = None
                window_duration_actual = 0.0

                left = 0
                for right in range(len(valid_entries)):
                    t_right = valid_entries[right]["dt"]
                    while left <= right and (t_right - valid_entries[left]["dt"]).total_seconds() > self.window_seconds:
                        left += 1

                    window_count = right - left + 1
                    if window_count > max_window_count:
                        max_window_count = window_count
                        max_window_users = [valid_entries[i]["user"] for i in range(left, right + 1)]
                        last_event = valid_entries[right]
                        window_duration_actual = max(1.0, (t_right - valid_entries[left]["dt"]).total_seconds())

                if max_window_count >= self.threshold:
                    target_user = max(set(max_window_users), key=max_window_users.count) if max_window_users else "root"
                    
                    # Real threat score computation based on attempt count, velocity, and targeted account
                    base_score = 50.0
                    excess_attempts = max_window_count - self.threshold
                    attempt_multiplier = min(30.0, excess_attempts * 3.5)
                    velocity = max_window_count / window_duration_actual  # attempts per second
                    velocity_bonus = min(10.0, velocity * 15.0)
                    sensitive_bonus = 10.0 if target_user.lower() in SENSITIVE_ACCOUNTS else 0.0

                    computed_score = int(min(100, max(50, round(base_score + attempt_multiplier + velocity_bonus + sensitive_bonus))))
                    sev = severity(computed_score)
                    mitre_data = get_mitre("Brute Force")
                    confidence = round(min(99.0, 80.0 + min(18.0, excess_attempts * 2.0)), 1)

                    alerts.append(
                        Alert(
                            attack="Brute Force",
                            ip=ip,
                            destination_ip=last_event["destination_ip"] if last_event else "10.0.0.1",
                            failed_attempts=max_window_count,
                            threat_score=computed_score,
                            severity=sev,
                            mitre=mitre_data,
                            user=target_user,
                            destination=last_event["destination"] if last_event else "auth.internal.corp",
                            host=last_event["destination"] if last_event else "server-01.corp.internal",
                            rule_name=f"Rolling Window Brute Force ({max_window_count} fails in {int(window_duration_actual)}s)",
                            confidence=confidence
                        )
                    )
            else:
                # Sequential fallback when logs lack absolute timestamps
                count = len(parsed_entries)
                if count >= self.threshold:
                    users = [p["user"] for p in parsed_entries]
                    target_user = max(set(users), key=users.count) if users else "root"
                    excess = count - self.threshold
                    computed_score = int(min(100, max(50, 50 + excess * 3 + (10 if target_user.lower() in SENSITIVE_ACCOUNTS else 0))))
                    sev = severity(computed_score)
                    mitre_data = get_mitre("Brute Force")

                    alerts.append(
                        Alert(
                            attack="Brute Force",
                            ip=ip,
                            destination_ip=parsed_entries[-1]["destination_ip"] if parsed_entries else "10.0.0.1",
                            failed_attempts=count,
                            threat_score=computed_score,
                            severity=sev,
                            mitre=mitre_data,
                            user=target_user,
                            destination=parsed_entries[-1]["destination"] if parsed_entries else "auth.internal.corp",
                            host=parsed_entries[-1]["destination"] if parsed_entries else "server-01.corp.internal",
                            rule_name=f"Sequential Auth Brute Force ({count} failed attempts)",
                            confidence=min(95.0, 75.0 + excess * 2.0)
                        )
                    )

        return alerts
