MITRE_ATTACK = {

    "Brute Force": {
        "technique": "T1110",
        "name": "Brute Force",
        "tactic": "Credential Access",
        "description": "Adversaries attempt to guess passwords repeatedly.",
        "recommendation": "Block the source IP, enable MFA, reset passwords and review authentication logs."
    },

    "Port Scan": {
        "technique": "T1595",
        "name": "Active Scanning",
        "tactic": "Reconnaissance",
        "description": "Scanning target systems before attacking.",
        "recommendation": "Block scanning IP and review firewall rules."
    },

    "Password Spray": {
        "technique": "T1110.003",
        "name": "Password Spraying",
        "tactic": "Credential Access",
        "description": "Adversaries attempt a single or small list of commonly used passwords against many user accounts.",
        "recommendation": "Enforce strong multi-factor authentication (MFA), password complexity rules, and alert on distributed login anomalies."
    },

    "Impossible Travel": {
        "technique": "T1078",
        "name": "Valid Accounts - Geo-velocity Anomaly",
        "tactic": "Initial Access / Defense Evasion",
        "description": "User authentication events originating from geographically impossible distances within an unfeasible time delta.",
        "recommendation": "Revoke active session tokens, force credential reset, and verify user identity out-of-band."
    },

    "SQL Injection": {
        "technique": "T1190",
        "name": "Exploit Public Facing Application",
        "tactic": "Initial Access",
        "description": "Attempt to exploit SQL Injection vulnerability.",
        "recommendation": "Validate inputs and use parameterized queries."
    },

    "XSS": {
        "technique": "T1059",
        "name": "Command and Scripting Interpreter",
        "tactic": "Execution",
        "description": "Execution using injected scripts.",
        "recommendation": "Sanitize user input and apply Content Security Policy."
    }

}

def get_mitre(attack):
    return MITRE_ATTACK.get(
        attack,
        {
            "technique": "Unknown",
            "name": "Unknown",
            "tactic": "Unknown",
            "description": "No mapping available.",
            "recommendation": "Investigate manually."
        }
    )