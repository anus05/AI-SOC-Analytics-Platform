from backend.scoring.threat_score import calculate_score, severity
from backend.mitre.mitre_mapper import get_mitre
from backend.models.alert import Alert


class BruteForceDetector:

    THRESHOLD = 5

    def detect(self, logs):

        failed_attempts = {}

        alerts = []

        for log in logs:

            if log["status"] != "Failed":

                continue

            ip = log["ip"]

            failed_attempts[ip] = failed_attempts.get(ip, 0) + 1

        for ip, count in failed_attempts.items():

            if count >= self.THRESHOLD:

                attack = "Brute Force"

                score = calculate_score(attack, count)

                level = severity(score)

                mitre = get_mitre(attack)

                alerts.append(

                    Alert(

                        attack,

                        ip,

                        count,

                        score,

                        level,

                        mitre

                    )

                )

        return alerts