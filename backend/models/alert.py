class Alert:

    def __init__(
        self,
        attack,
        ip,
        failed_attempts,
        threat_score,
        severity,
        mitre
    ):
        self.attack = attack
        self.ip = ip
        self.failed_attempts = failed_attempts
        self.threat_score = threat_score
        self.severity = severity
        self.mitre = mitre

    def to_dict(self):

        return {

            "attack": self.attack,

            "ip": self.ip,

            "failed_attempts": self.failed_attempts,

            "threat_score": self.threat_score,

            "severity": self.severity,

            "mitre": self.mitre

        }