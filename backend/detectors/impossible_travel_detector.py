from backend.scoring.threat_score import calculate_score, severity
from backend.mitre.mitre_mapper import get_mitre
from backend.models.alert import Alert


class ImpossibleTravelDetector:
    THRESHOLD = 2  # Same user account accessing from multiple distinct external IPs

    def detect(self, logs):
        ips_by_user = {}
        alerts = []

        for log in logs:
            user = log.get("user")
            ip = log.get("ip")
            if not user or not ip:
                continue

            # Ignore internal localhost if assessing external travel
            if ip in ("127.0.0.1", "::1", "localhost"):
                continue

            if user not in ips_by_user:
                ips_by_user[user] = set()
            ips_by_user[user].add(ip)

        for user, ips in ips_by_user.items():
            count = len(ips)
            if count >= self.THRESHOLD:
                attack = "Impossible Travel"
                score = calculate_score(attack, count)
                level = severity(score)
                mitre = get_mitre(attack)

                # Flag the primary offending IP
                primary_ip = sorted(list(ips))[-1]
                alert = Alert(
                    attack=attack,
                    ip=primary_ip,
                    failed_attempts=count,
                    threat_score=score,
                    severity=level,
                    mitre=mitre
                )
                alerts.append(alert)

        return alerts
