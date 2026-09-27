from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Set
from backend.scoring.threat_score import severity
from backend.mitre.mitre_mapper import get_mitre
from backend.models.alert import Alert
from backend.parser.log_parser import parse_log_timestamp

CRITICAL_PORTS = {21, 22, 23, 25, 53, 80, 110, 135, 139, 443, 445, 1433, 1521, 3306, 3389, 5432, 5985, 8080, 8443}


class PortScanDetector:
    """
    Detects Port Scanning attacks:
    Flags a single source IP touching many distinct destination ports on a target host/network
    within a short rolling time window (configurable via constants).
    """
    THRESHOLD: int = 5            # Minimum distinct destination ports probed
    WINDOW_SECONDS: int = 120     # Rolling time window in seconds (2 minutes)

    def __init__(self, threshold: int = 5, window_seconds: int = 120):
        self.threshold = threshold or self.THRESHOLD
        self.window_seconds = window_seconds or self.WINDOW_SECONDS

    def detect(self, logs: List[Dict[str, Any]]) -> List[Alert]:
        alerts = []
        if not logs:
            return alerts

        events_by_ip: Dict[str, List[Dict[str, Any]]] = {}

        for log in logs:
            ip = log.get("ip") or log.get("source_ip")
            port_val = log.get("port") or log.get("destination_port") or log.get("dst_port")
            if not ip or port_val is None:
                continue

            try:
                port_num = int(port_val)
            except Exception:
                continue

            if ip not in events_by_ip:
                events_by_ip[ip] = []
            events_by_ip[ip].append(log)

        for ip, events in events_by_ip.items():
            parsed_entries = []
            for e in events:
                dt = e.get("datetime") or parse_log_timestamp(e.get("timestamp"))
                port_val = e.get("port") or e.get("destination_port") or e.get("dst_port")
                dest = e.get("destination") or e.get("host") or "web.internal.corp"
                dest_ip = e.get("destination_ip") or e.get("dst_ip") or "10.0.0.1"
                try:
                    p = int(port_val)
                except Exception:
                    p = 0

                parsed_entries.append({
                    "dt": dt,
                    "port": p,
                    "destination": dest,
                    "destination_ip": dest_ip,
                    "raw": e.get("raw")
                })

            has_timestamps = any(item["dt"] is not None for item in parsed_entries)

            if has_timestamps:
                valid_entries = [p for p in parsed_entries if p["dt"] is not None]
                valid_entries.sort(key=lambda x: x["dt"])

                max_distinct_ports: Set[int] = set()
                total_probes_in_max_window = 0
                last_event: Optional[Dict[str, Any]] = None
                window_duration_actual = 0.0

                left = 0
                for right in range(len(valid_entries)):
                    t_right = valid_entries[right]["dt"]
                    while left <= right and (t_right - valid_entries[left]["dt"]).total_seconds() > self.window_seconds:
                        left += 1

                    window_ports = {valid_entries[i]["port"] for i in range(left, right + 1) if valid_entries[i]["port"] > 0}
                    if len(window_ports) > len(max_distinct_ports):
                        max_distinct_ports = window_ports
                        total_probes_in_max_window = right - left + 1
                        last_event = valid_entries[right]
                        window_duration_actual = max(1.0, (t_right - valid_entries[left]["dt"]).total_seconds())

                distinct_count = len(max_distinct_ports)
                if distinct_count >= self.threshold:
                    # Signal-based threat score computation
                    base_score = 50.0
                    excess_ports = distinct_count - self.threshold
                    port_multiplier = min(30.0, excess_ports * 3.0)
                    sensitive_count = len(max_distinct_ports.intersection(CRITICAL_PORTS))
                    sensitive_bonus = min(15.0, sensitive_count * 3.0)
                    velocity = distinct_count / window_duration_actual
                    velocity_bonus = min(10.0, velocity * 10.0)

                    computed_score = int(min(100, max(50, round(base_score + port_multiplier + sensitive_bonus + velocity_bonus))))
                    sev = severity(computed_score)
                    mitre_data = get_mitre("Port Scan")
                    confidence = round(min(98.0, 80.0 + excess_ports * 2.0), 1)

                    ports_sample = sorted(list(max_distinct_ports))[:6]
                    ports_str = ", ".join(str(p) for p in ports_sample)
                    if len(max_distinct_ports) > 6:
                        ports_str += f" (+{len(max_distinct_ports) - 6} more)"

                    alerts.append(
                        Alert(
                            attack="Port Scan",
                            ip=ip,
                            destination_ip=last_event["destination_ip"] if last_event else "10.0.0.1",
                            failed_attempts=total_probes_in_max_window,
                            threat_score=computed_score,
                            severity=sev,
                            mitre=mitre_data,
                            user="network",
                            destination=last_event["destination"] if last_event else "network.internal.corp",
                            host=last_event["destination"] if last_event else "server-01.corp.internal",
                            rule_name=f"Reconnaissance Port Scan ({distinct_count} ports: [{ports_str}] in {int(window_duration_actual)}s)",
                            confidence=confidence
                        )
                    )
            else:
                all_ports = {p["port"] for p in parsed_entries if p["port"] > 0}
                distinct_count = len(all_ports)
                if distinct_count >= self.threshold:
                    excess = distinct_count - self.threshold
                    sensitive_count = len(all_ports.intersection(CRITICAL_PORTS))
                    computed_score = int(min(100, max(50, 50 + excess * 3 + sensitive_count * 3)))
                    sev = severity(computed_score)
                    mitre_data = get_mitre("Port Scan")

                    ports_sample = sorted(list(all_ports))[:6]
                    ports_str = ", ".join(str(p) for p in ports_sample)
                    if len(all_ports) > 6:
                        ports_str += f" (+{len(all_ports) - 6} more)"

                    alerts.append(
                        Alert(
                            attack="Port Scan",
                            ip=ip,
                            destination_ip=parsed_entries[-1]["destination_ip"] if parsed_entries else "10.0.0.1",
                            failed_attempts=len(parsed_entries),
                            threat_score=computed_score,
                            severity=sev,
                            mitre=mitre_data,
                            user="network",
                            destination=parsed_entries[-1]["destination"] if parsed_entries else "network.internal.corp",
                            host=parsed_entries[-1]["destination"] if parsed_entries else "server-01.corp.internal",
                            rule_name=f"Sequential Port Scan ({distinct_count} probed ports: [{ports_str}])",
                            confidence=min(92.0, 75.0 + excess * 2.0)
                        )
                    )

        return alerts
