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