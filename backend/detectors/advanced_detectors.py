from typing import List, Dict, Any
from backend.models.alert import Alert
from backend.scoring.threat_score import severity
from backend.mitre.mitre_mapper import get_mitre


class PrivilegeEscalationDetector:
    def detect(self, logs: List[Dict[str, Any]]) -> List[Alert]:
        alerts = []
        priv_keywords = [
            "privilege_elevation", "token_elevation", "uac_bypass", 
            "seimpersonate", "dirtycow", "pwnkit", "cve-2021-4034", "cve-2021-3156"
        ]
        for log in logs:
            raw = str(log.get("raw", "")).lower()
            user = log.get("user", "unknown")
            if any(k in raw for k in priv_keywords):
                ip = log.get("ip", "127.0.0.1")
                alerts.append(
                    Alert(
                        attack="Privilege Escalation",
                        ip=ip,
                        failed_attempts=1,
                        threat_score=85,
                        severity="HIGH",
                        mitre=get_mitre("Privilege Escalation") if "Privilege Escalation" in ["Privilege Escalation"] else "T1068",
                        user=user,
                        rule_name="Privilege Escalation Exploitation Signature",
                        confidence=90.0
                    )
                )
        return alerts


class LateralMovementDetector:
    def detect(self, logs: List[Dict[str, Any]]) -> List[Alert]:
        alerts = []
        lm_keywords = ["psexec", "wmiexec", "smbexec", "pass-the-hash", "pth-winexe", "invoke-wmiexec"]
        for log in logs:
            raw = str(log.get("raw", "")).lower()
            if any(k in raw for k in lm_keywords):
                ip = log.get("ip", "10.0.0.50")
                alerts.append(
                    Alert(
                        attack="Lateral Movement",
                        ip=ip,
                        failed_attempts=1,
                        threat_score=82,
                        severity="HIGH",
                        mitre="T1021 - Remote Services",
                        user=log.get("user", "Administrator"),
                        rule_name="Lateral Movement Execution Signature",
                        confidence=88.0
                    )
                )
        return alerts


class BeaconingDetector:
    def detect(self, logs: List[Dict[str, Any]]) -> List[Alert]:
        alerts = []
        # External regular C2 beaconing analysis
        outbound_events: Dict[str, List[float]] = {}
        for log in logs:
            ip = log.get("ip")
            dt = log.get("datetime")
            if ip and dt and not (ip.startswith("10.") or ip.startswith("192.168.") or ip in ("127.0.0.1", "::1", "localhost")):
                if ip not in outbound_events:
                    outbound_events[ip] = []
                outbound_events[ip].append(dt.timestamp())

        for ip, timestamps in outbound_events.items():
            if len(timestamps) >= 15:
                timestamps.sort()
                deltas = [timestamps[i + 1] - timestamps[i] for i in range(len(timestamps) - 1)]
                if deltas:
                    avg_delta = sum(deltas) / len(deltas)
                    if avg_delta > 0:
                        variance = sum((d - avg_delta) ** 2 for d in deltas) / len(deltas)
                        std_dev = variance ** 0.5
                        # Low jitter relative to interval indicates periodic C2 beaconing
                        if std_dev < max(3.0, avg_delta * 0.15):
                            alerts.append(
                                Alert(
                                    attack="C2 Beaconing",
                                    ip=ip,
                                    failed_attempts=len(timestamps),
                                    threat_score=80,
                                    severity="HIGH",
                                    mitre="T1071 - Application Layer Protocol C2",
                                    user="System",
                                    rule_name=f"Periodic C2 Beaconing (~{int(avg_delta)}s interval, low jitter)",
                                    confidence=85.0
                                )
                            )
        return alerts


class CredentialDumpingDetector:
    def detect(self, logs: List[Dict[str, Any]]) -> List[Alert]:
        alerts = []
        cred_keywords = ["mimikatz", "procdump lsass", "sekurlsa::logonpasswords", "ntds.dit export", "hashdump", "secretsdump"]
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
        ps_keywords = ["-encodedcommand", "downloadstring", "invoke-expression", "iex(new-object", "bypass -noprofile -enc"]
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
        ransom_keywords = ["vssadmin delete shadows", "wbadmin delete systemstatebackup", "bcdedit /set {default} recoveryenabled no", ".locked", "readme_decrypt"]
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
        lotl_patterns = ["certutil -urlcache -split -f", "bitsadmin /transfer", "mshta javascript:", "regsvr32 /s /n /u /i:http"]
        for log in logs:
            raw = str(log.get("raw", "")).lower()
            if any(p in raw for p in lotl_patterns):
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
        # Off-hours detector disabled for batch historical logs to avoid false positives on legitimate shift workers
        return []


class AbnormalUserBehaviourDetector:
    def detect(self, logs: List[Dict[str, Any]]) -> List[Alert]:
        alerts = []
        user_failures = {}
        for log in logs:
            if str(log.get("status", "")).lower() in ["failed", "fail", "invalid"]:
                u = log.get("user", "unknown")
                if u and u not in ["unknown", "none", "-"]:
                    user_failures[u] = user_failures.get(u, 0) + 1

        for user, count in user_failures.items():
            if count >= 15:
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
        suspicious_parents = ["winword.exe -> cmd.exe", "excel.exe -> powershell.exe", "explorer.exe -> mshta.exe", "w3wp.exe -> cmd.exe"]
        for log in logs:
            raw = str(log.get("raw", "")).lower()
            if any(p in raw for p in suspicious_parents):
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
                        rule_name="Office/Web Application Spawning Command Shell",
                        confidence=91.0
                    )
                )
        return alerts


class PersistenceTechniquesDetector:
    def detect(self, logs: List[Dict[str, Any]]) -> List[Alert]:
        alerts = []
        pers_keywords = ["schtasks /create", "reg add .*currentversion\\run", "crontab -e .*curl", "systemctl enable .*\\.service"]
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
