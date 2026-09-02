def calculate_score(attack, count):
    """
    Calculate threat score based on attack type and count.
    """
    if attack == "Brute Force":
        if count >= 100:
            return 100
        elif count >= 50:
            return 90
        elif count >= 20:
            return 80
        elif count >= 10:
            return 70
        else:
            return 60

    elif attack == "Password Spray":
        if count >= 20:
            return 95
        elif count >= 10:
            return 85
        elif count >= 5:
            return 75
        elif count >= 3:
            return 65
        else:
            return 50

    elif attack == "Impossible Travel":
        if count >= 4:
            return 95
        elif count >= 3:
            return 85
        elif count >= 2:
            return 75
        else:
            return 60

    elif attack == "Port Scan":
        if count >= 50:
            return 90
        elif count >= 20:
            return 80
        elif count >= 10:
            return 70
        elif count >= 5:
            return 60
        else:
            return 50

    elif attack in ("SQL Injection", "XSS"):
        if count >= 5:
            return 95
        else:
            return 80

    return min(100, max(20, count * 5))



def severity(score):
    """
    Convert score into severity level.
    """

    if score >= 90:
        return "CRITICAL"

    elif score >= 70:
        return "HIGH"

    elif score >= 50:
        return "MEDIUM"

    else:
        return "LOW"