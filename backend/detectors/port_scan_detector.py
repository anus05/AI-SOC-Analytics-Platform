from backend.scoring.threat_score import calculate_score, severity
from backend.mitre.mitre_mapper import get_mitre
from backend.models.alert import Alert


class PortScanDetector:
    THRESHOLD = 5  # Distinct ports scanned by the same IP

    def detect(self, logs):
        ports_by_ip = {}
        alerts = []

        for log in logs:
            ip = log.get("ip")
            port = log.get("port")
            if not ip or port is None:
                continue

            if ip not in ports_by_ip:
                ports_by_ip[ip] = set()
            ports_by_ip[ip].add(port)

        for ip, ports in ports_by_ip.items():
            count = len(ports)
            if count >= self.THRESHOLD:
                attack = "Port Scan"
                score = calculate_score(attack, count)
                level = severity(score)
                mitre = get_mitre(attack)

                alert = Alert(
                    attack=attack,
                    ip=ip,
                    failed_attempts=count,
                    threat_score=score,
                    severity=level,
                    mitre=mitre
                )
                alerts.append(alert)

        return alerts
