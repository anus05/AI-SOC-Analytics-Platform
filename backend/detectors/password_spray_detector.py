from backend.scoring.threat_score import calculate_score, severity
from backend.mitre.mitre_mapper import get_mitre
from backend.models.alert import Alert


class PasswordSprayDetector:
    THRESHOLD = 3  # Multiple distinct usernames targeted from the same IP

    def detect(self, logs):
        user_attempts = {}
        alerts = []

        for log in logs:
            if log.get("status") != "Failed":
                continue

            ip = log.get("ip")
            user = log.get("user")
            if not ip or not user:
                continue

            if ip not in user_attempts:
                user_attempts[ip] = set()
            user_attempts[ip].add(user)

        for ip, users in user_attempts.items():
            count = len(users)
            if count >= self.THRESHOLD:
                attack = "Password Spray"
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
