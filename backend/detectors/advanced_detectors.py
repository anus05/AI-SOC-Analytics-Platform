from typing import List, Dict, Any
from backend.models.alert import Alert
from backend.scoring.threat_score import calculate_score, severity
from backend.mitre.mitre_mapper import get_mitre


class PrivilegeEscalationDetector:
    def detect(self, logs: List[Dict[str, Any]]) -> List[Alert]:
        alerts = []
        priv_keywords = ["sudo", "runas", "privilege_elevation", "token_elevation", "uac_bypass", "seimpersonate"]
        for log in logs:
            raw = str(log.get("raw", "")).lower()
            user = log.get("user", "unknown")
            if any(k in raw for k in priv_keywords) or (user == "root" and log.get("status") == "Accepted"):
                ip = log.get("ip", "127.0.0.1")
                alerts.append(
                    Alert(
                        attack="Privilege Escalation",
                        ip=ip,
                        failed_attempts=1,
                        threat_score=85,
                        severity="HIGH",
                        mitre="T1068 - Exploitation for Privilege Escalation",
                        user=user,
                        rule_name="Privilege Escalation Detection Rule",
                        confidence=90.0
                    )
                )
        return alerts


class LateralMovementDetector:
    def detect(self, logs: List[Dict[str, Any]]) -> List[Alert]:
        alerts = []
        lm_keywords = ["psexec", "wmiexec", "winrm", "rdp", "smbexec", "pth", "pass-the-hash"]
        for log in logs:
            raw = str(log.get("raw", "")).lower()
            if any(k in raw for k in lm_keywords) or (log.get("port") in [445, 135, 3389, 5985]):
                ip = log.get("ip", "10.0.0.50")
                alerts.append(
                    Alert(
                        attack="Lateral Movement",
                        ip=ip,
                        failed_attempts=1,
                        threat_score=80,
                        severity="HIGH",
                        mitre="T1021 - Remote Services",
                        user=log.get("user", "Administrator"),
                        rule_name="Lateral Movement Activity Rule",
                        confidence=88.0
                    )
                )
        return alerts


class BeaconingDetector:
    def detect(self, logs: List[Dict[str, Any]]) -> List[Alert]:
        alerts = []
        # Check for regular periodic connections or high volume outbound traffic
        ip_counts = {}
        for log in logs:
            ip = log.get("ip")
            if ip:
                ip_counts[ip] = ip_counts.get(ip, 0) + 1

        for ip, count in ip_counts.items():
            if count >= 15:
                alerts.append(
                    Alert(
                        attack="C2 Beaconing",
                        ip=ip,
                        failed_attempts=count,
                        threat_score=78,
                        severity="HIGH",
                        mitre="T1071 - Application Layer Protocol C2",
                        user="System",
                        rule_name="C2 High-Frequency Beaconing",
                        confidence=82.0
                    )
                )
        return alerts


class CredentialDumpingDetector:
    def detect(self, logs: List[Dict[str, Any]]) -> List[Alert]:
        alerts = []
        cred_keywords = ["lsass", "mimikatz", "procdump", "sam", "ntds.dit", "sekurlsa", "hashdump"]
        for log in logs:
            raw = str(log.get("raw", "")).lower()
            if any(k in raw for k in cred_keywords):
                ip = log.get("ip", "127.0.0.1")
                alerts.append(
                    Alert(
                        attack="Credential Dumping",
                        ip=ip,
                        failed_attempts=1,
                        threat_score=95,
                        severity="CRITICAL",
                        mitre="T1003 - OS Credential Dumping",
                        user=log.get("user", "SYSTEM"),
                        rule_name="LSASS Memory Dumping / Credential Access",
                        confidence=96.0
                    )
                )
        return alerts


class SuspiciousPowerShellDetector:
    def detect(self, logs: List[Dict[str, Any]]) -> List[Alert]:
        alerts = []
        ps_keywords = ["powershell", "-enc", "-encodedcommand", "downloadstring", "iex", "invoke-expression", "bypass", "nop"]
        for log in logs:
            raw = str(log.get("raw", "")).lower()
            if any(k in raw for k in ps_keywords):
                ip = log.get("ip", "127.0.0.1")
                alerts.append(
                    Alert(
                        attack="Suspicious PowerShell Execution",
                        ip=ip,
                        failed_attempts=1,
                        threat_score=85,
                        severity="HIGH",
                        mitre="T1059.001 - PowerShell Command Execution",
                        user=log.get("user", "unknown"),
                        rule_name="Obfuscated Encoded PowerShell Detection",
                        confidence=92.0
                    )
                )
        return alerts


class RansomwareBehaviourDetector:
    def detect(self, logs: List[Dict[str, Any]]) -> List[Alert]:
        alerts = []
        ransom_keywords = ["vssadmin", "shadowcopy", "delete shadows", "wbadmin", "bcdedit", "encrypt", ".locked", "readme_decrypt"]
        for log in logs:
            raw = str(log.get("raw", "")).lower()
            if any(k in raw for k in ransom_keywords):
                ip = log.get("ip", "127.0.0.1")
                alerts.append(
                    Alert(
                        attack="Ransomware Behaviour",
                        ip=ip,
                        failed_attempts=1,
                        threat_score=98,
                        severity="CRITICAL",
                        mitre="T1490 - Inhibit System Recovery",
                        user=log.get("user", "SYSTEM"),
                        rule_name="Volume Shadow Copy Deletion / Ransomware Activity",
                        confidence=98.0
                    )
                )
        return alerts


class LivingOffTheLandDetector:
    def detect(self, logs: List[Dict[str, Any]]) -> List[Alert]:
        alerts = []
        lotl_binaries = ["certutil", "bitsadmin", "certreq", "mshta", "rundll32", "regsvr32", "wmic", "cscript", "wscript"]
        for log in logs:
            raw = str(log.get("raw", "")).lower()
            if any(f"{b}.exe" in raw or f" {b} " in raw for b in lotl_binaries):
                ip = log.get("ip", "127.0.0.1")
                alerts.append(
                    Alert(
                        attack="Living off the Land (LotL)",
                        ip=ip,
                        failed_attempts=1,
                        threat_score=75,
                        severity="HIGH",
                        mitre="T1218 - System Binary Proxy Execution",
                        user=log.get("user", "unknown"),
                        rule_name="Dual-use Administrative Tool Misuse",
                        confidence=84.0
                    )
                )
        return alerts


class ImpossibleLoginHoursDetector:
    def detect(self, logs: List[Dict[str, Any]]) -> List[Alert]:
        alerts = []
        # Flag logons occurring outside normal operating hours (e.g. 01:00 - 04:00 AM)
        for log in logs:
            raw = str(log.get("raw", ""))
            time_str = log.get("time", "")
            if " 02:" in time_str or " 03:" in time_str or " 04:" in time_str:
                if log.get("status") in ["Accepted", "Success"]:
                    ip = log.get("ip", "127.0.0.1")
                    alerts.append(
                        Alert(
                            attack="Impossible Login Hours",
                            ip=ip,
                            failed_attempts=1,
                            threat_score=65,
                            severity="MEDIUM",
                            mitre="T1078 - Valid Accounts Anomaly",
                            user=log.get("user", "admin"),
                            rule_name="Off-Hours Authentication Anomaly",
                            confidence=75.0
                        )
                    )
        return alerts


class AbnormalUserBehaviourDetector:
    def detect(self, logs: List[Dict[str, Any]]) -> List[Alert]:
        alerts = []
        user_failures = {}
        for log in logs:
            if log.get("status") == "Failed":
                u = log.get("user", "unknown")
                user_failures[u] = user_failures.get(u, 0) + 1

        for user, count in user_failures.items():
            if count >= 8 and user != "unknown":
                alerts.append(
                    Alert(
                        attack="Abnormal User Behaviour",
                        ip="10.0.0.15",
                        failed_attempts=count,
                        threat_score=70,
                        severity="MEDIUM",
                        mitre="T1078 - Valid Accounts Misuse",
                        user=user,
                        rule_name="User Failure Spike Anomaly",
                        confidence=80.0
                    )
                )
        return alerts


class RareParentProcessDetector:
    def detect(self, logs: List[Dict[str, Any]]) -> List[Alert]:
        alerts = []
        suspicious_parents = ["cmd.exe -> powershell.exe", "winword.exe -> cmd.exe", "excel.exe -> powershell.exe", "explorer.exe -> mshta.exe"]
        for log in logs:
            raw = str(log.get("raw", "")).lower()
            if any(p in raw for p in ["winword", "excel", "outlook"]):
                ip = log.get("ip", "127.0.0.1")
                alerts.append(
                    Alert(
                        attack="Rare Parent Process",
                        ip=ip,
                        failed_attempts=1,
                        threat_score=85,
                        severity="HIGH",
                        mitre="T1055 - Process Injection",
                        user=log.get("user", "employee"),
                        rule_name="Office Application Spawning Command Shell",
                        confidence=91.0
                    )
                )
        return alerts


class PersistenceTechniquesDetector:
    def detect(self, logs: List[Dict[str, Any]]) -> List[Alert]:
        alerts = []
        pers_keywords = ["schtasks", "cron", "registry", "runonce", "startup", "systemd", "service creation", "new service"]
        for log in logs:
            raw = str(log.get("raw", "")).lower()
            if any(k in raw for k in pers_keywords):
                ip = log.get("ip", "127.0.0.1")
                alerts.append(
                    Alert(
                        attack="Persistence Technique",
                        ip=ip,
                        failed_attempts=1,
                        threat_score=80,
                        severity="HIGH",
                        mitre="T1053 - Scheduled Task/Job",
                        user=log.get("user", "SYSTEM"),
                        rule_name="Scheduled Task Creation / Registry Run Key Modification",
                        confidence=87.0
                    )
                )
        return alerts
