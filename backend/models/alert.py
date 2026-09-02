class Alert:
    def __init__(
        self,
        attack,
        ip,
        failed_attempts=1,
        threat_score=50,
        severity="MEDIUM",
        mitre="T1110",
        user="Unknown",
        destination="auth.internal.corp",
        destination_ip="10.0.0.1",
        host="server-01.corp.internal",
        status="New",
        confidence=85.0,
        rule_name="Standard Analytics Rule",
        ml_probability=0.0,
        fp_probability=0.0,
        explainability_json="{}"
    ):
        self.attack = attack
        self.ip = ip
        self.destination_ip = destination_ip
        self.failed_attempts = failed_attempts
        self.threat_score = threat_score
        self.severity = severity
        self.mitre = mitre
        self.user = user
        self.destination = destination
        self.host = host
        self.status = status
        self.confidence = confidence
        self.rule_name = rule_name
        self.ml_probability = ml_probability
        self.fp_probability = fp_probability
        self.explainability_json = explainability_json

    def to_dict(self):
        return {
            "attack": self.attack,
            "ip": self.ip,
            "destination_ip": self.destination_ip,
            "failed_attempts": self.failed_attempts,
            "threat_score": self.threat_score,
            "severity": self.severity,
            "confidence": self.confidence,
            "mitre": self.mitre,
            "user": self.user,
            "destination": self.destination,
            "host": self.host,
            "status": self.status,
            "rule_name": self.rule_name,
            "ml_probability": self.ml_probability,
            "fp_probability": self.fp_probability,
            "explainability_json": self.explainability_json
        }