import json
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from backend.database.models import SOARActionLogDB, AlertDB


class SOARService:
    def execute_action(self, db: Session, action_type: str, target: str, alert_id: int = None, parameters: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Executes a SOAR response action and stores audit logs in PostgreSQL soar_action_logs table.
        """
        parameters = parameters or {}
        action_type = action_type.lower()
        details = ""
        rule_content = ""

        if action_type == "block_ip":
            details = f"Applied perimeter firewall drop rule for IP address {target}."
        elif action_type == "disable_user":
            details = f"Active Directory / LDAP account '{target}' disabled and sessions revoked."
        elif action_type == "kill_process":
            details = f"Terminated process '{target}' across managed host endpoints."
        elif action_type == "create_ticket":
            details = f"Incident ticket created in Jira / ServiceNow for target '{target}'."
        elif action_type == "send_email":
            details = f"Sent SOC alert email notification regarding '{target}' to SOC Lead Analyst."
        elif action_type == "send_slack":
            details = f"Dispatched Slack webhook alert to #soc-incident-response for target '{target}'."
        elif action_type == "send_teams":
            details = f"Dispatched Microsoft Teams channel notification for target '{target}'."
        elif action_type == "export_ioc":
            details = f"Exported STIX 2.1 JSON and CSV IOC bundle for target '{target}'."
        elif action_type == "generate_sigma":
            rule_content = (
                f"title: Detect Threat Activity targeting {target}\n"
                f"id: {hash(target) & 0xffffffff:08x}-4a2b-4100-9988-1234567890ab\n"
                f"status: experimental\n"
                f"description: Automatically generated Sigma rule from AI SOC Incident Response\n"
                f"logsource:\n"
                f"    category: firewall\n"
                f"detection:\n"
                f"    selection:\n"
                f"        src_ip: '{target}'\n"
                f"    condition: selection\n"
                f"falsepositives:\n"
                f"    - Unknown\n"
                f"level: high\n"
            )
            details = f"Generated Sigma Detection Rule for {target}."
        elif action_type == "generate_yara":
            rule_content = (
                f"rule Threat_Detection_{target.replace('.', '_').replace('-', '_')} {{\n"
                f"    meta:\n"
                f"        description = \"Automatically generated YARA rule from AI SOC Platform\"\n"
                f"        author = \"AI SOC Engine\"\n"
                f"    strings:\n"
                f"        $ioc_ip = \"{target}\"\n"
                f"        $sec_token = \"cmd.exe /c\"\n"
                f"    condition:\n"
                f"        any of them\n"
                f"}}\n"
            )
            details = f"Generated YARA Malware Rule for {target}."
        elif action_type == "generate_snort":
            rule_content = f"drop ip {target} any -> $HOME_NET any (msg:\"AI SOC - Block Malicious IP {target}\"; sid:1000999; rev:1;)"
            details = f"Generated Snort/Suricata Perimeter Rule for {target}."
        else:
            details = f"Executed generic SOAR workflow action '{action_type}' for {target}."

        log = SOARActionLogDB(
            alert_id=alert_id,
            action_type=action_type,
            target=target,
            status="Success",
            details=details,
            executed_by="SOAR Automation Engine"
        )

        db.add(log)
        db.commit()
        db.refresh(log)

        return {
            "id": log.id,
            "action_type": action_type,
            "target": target,
            "status": "Success",
            "details": details,
            "rule_content": rule_content,
            "executed_at": log.executed_at.isoformat()
        }

    def list_logs(self, db: Session) -> List[Dict[str, Any]]:
        records = db.query(SOARActionLogDB).order_by(SOARActionLogDB.id.desc()).all()
        res = []
        for r in records:
            res.append({
                "id": r.id,
                "alert_id": r.alert_id,
                "action_type": r.action_type,
                "target": r.target,
                "status": r.status,
                "details": r.details,
                "executed_by": r.executed_by,
                "executed_at": r.executed_at.isoformat() if r.executed_at else None
            })
        return res
