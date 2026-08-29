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

    return 0


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