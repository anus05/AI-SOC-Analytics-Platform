import re
import json
import csv
import io
from typing import List, Dict, Any, Optional
from datetime import datetime

# RegEx patterns for multi-format log parsing
IP_PATTERN = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")
TIMESTAMP_PATTERN = re.compile(r"\b(?:\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}|\w{3}\s+\d+\s+\d{2}:\d{2}:\d{2})\b")

# Apache/Nginx combined access log pattern
WEB_LOG_PATTERN = re.compile(
    r'^(?P<ip>\S+)\s+\S+\s+(?P<user>\S+)\s+\[(?P<timestamp>[^\]]+)\]\s+"(?P<method>\S+)\s+(?P<path>\S+)\s+HTTP/[0-9.]+"\s+(?P<status>\d{3})\s+(?P<size>\S+)'
)

# Standard Linux Syslog pattern
SYSLOG_PATTERN = re.compile(
    r"^(?P<month>\w+)\s+(?P<day>\d+)\s+(?P<time>\d+:\d+:\d+)\s+(?P<host>\S+)\s+(?P<process>\S+?)(?:\[(?P<pid>\d+)\])?:?\s+(?P<message>.*)$"
)

# SSH Auth log pattern
SSH_AUTH_PATTERN = re.compile(
    r"(?P<status>Failed|Accepted|Invalid user|Failed password)\s+(?:password\s+)?for\s+(?:invalid\s+user\s+)?(?P<user>\S+)\s+from\s+(?P<ip>\d+\.\d+\.\d+\.\d+)(?:\s+port\s+(?P<port>\d+))?"
)

# Firewall log pattern (e.g., iptables / UFW)
FIREWALL_PATTERN = re.compile(
    r"IN=(?P<in_iface>\S*)\s+OUT=(?P<out_iface>\S*)\s+SRC=(?P<ip>\d+\.\d+\.\d+\.\d+)\s+DST=(?P<dst_ip>\d+\.\d+\.\d+\.\d+).*?PROTO=(?P<proto>\S+)(?:.*?SPT=(?P<spt>\d+)\s+DPT=(?P<dpt>\d+))?"
)


def parse_single_line(line: str, format_hint: str = "auto") -> Optional[Dict[str, Any]]:
    """
    Parses a single log line according to specified format or auto-detection.
    """
    line = line.strip()
    if not line or line.startswith("#"):
        return None

    # Check SSH / Linux auth log
    ssh_match = SSH_AUTH_PATTERN.search(line)
    if ssh_match:
        d = ssh_match.groupdict()
        status_clean = "Failed" if "Failed" in d["status"] or "Invalid" in d["status"] else "Accepted"
        return {
            "log_type": "syslog_auth",
            "ip": d.get("ip"),
            "user": d.get("user", "unknown"),
            "status": status_clean,
            "port": int(d.get("port", 22)) if d.get("port") else 22,
            "raw": line
        }

    # Check Apache / Nginx Web Log
    web_match = WEB_LOG_PATTERN.search(line)
    if web_match:
        d = web_match.groupdict()
        status_code = int(d["status"])
        status_str = "Failed" if status_code >= 400 else "Accepted"
        return {
            "log_type": "web_access",
            "ip": d["ip"],
            "user": d["user"] if d["user"] != "-" else "anonymous",
            "path": d["path"],
            "method": d["method"],
            "status": status_str,
            "status_code": status_code,
            "raw": line
        }

    # Check Firewall Log
    fw_match = FIREWALL_PATTERN.search(line)
    if fw_match:
        d = fw_match.groupdict()
        return {
            "log_type": "firewall",
            "ip": d["ip"],
            "dst_ip": d.get("dst_ip"),
            "proto": d.get("proto"),
            "port": int(d.get("dpt", 0)) if d.get("dpt") else 0,
            "status": "Blocked" if "BLOCK" in line or "DROP" in line else "Allowed",
            "raw": line
        }

    # Standard Syslog Fallback
    syslog_match = SYSLOG_PATTERN.search(line)
    if syslog_match:
        d = syslog_match.groupdict()
        ips = IP_PATTERN.findall(line)
        ip = ips[0] if ips else "127.0.0.1"
        status = "Failed" if any(w in line.lower() for w in ["fail", "error", "deny", "invalid", "unauthorized"]) else "Success"
        return {
            "log_type": "syslog",
            "host": d.get("host"),
            "process": d.get("process"),
            "ip": ip,
            "status": status,
            "user": "root" if "root" in line else "user",
            "raw": line
        }

    # Generic Fallback Regex extraction
    ips = IP_PATTERN.findall(line)
    if ips:
        status = "Failed" if any(w in line.lower() for w in ["fail", "error", "deny", "refused", "invalid"]) else "Success"
        return {
            "log_type": "generic_text",
            "ip": ips[0],
            "status": status,
            "user": "unknown",
            "raw": line
        }

    return None


def parse_json_log(content: str) -> List[Dict[str, Any]]:
    """
    Parses JSON log string (single JSON object, JSON array, or newline-delimited JSON).
    Handles Wazuh, Suricata (eve.json), Sysmon JSON, Defender/CrowdStrike JSON.
    """
    results = []
    content = content.strip()
    if not content:
        return results

    try:
        data = json.loads(content)
        if isinstance(data, list):
            items = data
        else:
            items = [data]
    except Exception:
        # Try line by line JSON
        items = []
        for line in content.splitlines():
            line = line.strip()
            if line:
                try:
                    items.append(json.loads(line))
                except Exception:
                    continue

    for item in items:
        if not isinstance(item, dict):
            continue

        # Extract IP, User, Status from nested structures (Suricata, Wazuh, Sysmon, Defender)
        ip = (
            item.get("src_ip") or
            item.get("source_ip") or
            item.get("ClientIP") or
            item.get("src_ip_addr") or
            item.get("ip") or
            item.get("data", {}).get("srcip") if isinstance(item.get("data"), dict) else None
        )
        if not ip:
            # Fallback regex search on dumped item
            ips = IP_PATTERN.findall(json.dumps(item))
            ip = ips[0] if ips else "127.0.0.1"

        user = (
            item.get("user") or
            item.get("username") or
            item.get("user_name") or
            item.get("AccountName") or
            item.get("data", {}).get("dstuser") if isinstance(item.get("data"), dict) else None
        ) or "unknown"

        status_raw = str(item.get("status") or item.get("action") or item.get("result") or "").lower()
        status = "Failed" if any(w in status_raw for w in ["fail", "deny", "block", "drop", "invalid"]) else "Success"

        results.append({
            "log_type": item.get("event_type") or item.get("log_type") or "json_event",
            "ip": ip,
            "user": user,
            "status": status,
            "raw": json.dumps(item)
        })

    return results


def parse_csv_log(content: str) -> List[Dict[str, Any]]:
    """
    Parses CSV log content (CrowdStrike export, Defender export, Firewall CSV).
    """
    results = []
    reader = csv.DictReader(io.StringIO(content))
    for row in reader:
        # Find IP column dynamically
        ip = "127.0.0.1"
        user = "unknown"
        status = "Success"

        for k, v in row.items():
            if not k or not v:
                continue
            key_lower = k.lower()
            if "ip" in key_lower or "source" in key_lower:
                match = IP_PATTERN.search(str(v))
                if match:
                    ip = match.group(0)
            elif "user" in key_lower or "account" in key_lower:
                user = str(v)
            elif "status" in key_lower or "action" in key_lower or "outcome" in key_lower:
                v_lower = str(v).lower()
                if any(w in v_lower for w in ["fail", "block", "deny", "drop", "error"]):
                    status = "Failed"

        results.append({
            "log_type": "csv_export",
            "ip": ip,
            "user": user,
            "status": status,
            "raw": json.dumps(row)
        })

    return results


def parse_file(file_path: str) -> List[Dict[str, Any]]:
    """
    Reads and parses a log file from local path.
    """
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()

        if file_path.endswith(".json"):
            return parse_json_log(content)
        elif file_path.endswith(".csv"):
            return parse_csv_log(content)
        else:
            logs = []
            for line in content.splitlines():
                parsed = parse_single_line(line)
                if parsed:
                    logs.append(parsed)
            return logs
    except Exception as e:
        print(f"[LogParser Error] Failed reading file {file_path}: {e}")
        return []


def parse_content(content: str, filename: str = "") -> List[Dict[str, Any]]:
    """
    Parses raw string content uploaded via frontend drag-and-drop or API.
    """
    filename_lower = filename.lower()
    if filename_lower.endswith(".json") or content.strip().startswith(("{", "[")):
        return parse_json_log(content)
    elif filename_lower.endswith(".csv") or "," in content.splitlines()[0]:
        return parse_csv_log(content)
    else:
        logs = []
        for line in content.splitlines():
            parsed = parse_single_line(line)
            if parsed:
                logs.append(parsed)
        return logs