import os
import re
import json
import csv
import io
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

# RegEx patterns for multi-format log parsing
IP_PATTERN = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")
TIMESTAMP_PATTERN = re.compile(r"\b(?:\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?|\w{3}\s+\d+\s+\d{2}:\d{2}:\d{2})\b")

# Apache/Nginx combined access log pattern
WEB_LOG_PATTERN = re.compile(
    r'^(?P<ip>\S+)\s+\S+\s+(?P<user>\S+)\s+\[(?P<timestamp>[^\]]+)\]\s+"(?P<method>\S+)\s+(?P<path>\S+)\s+HTTP/[0-9.]+"\s+(?P<status>\d{3})\s+(?P<size>\S+)'
)

# Standard Linux Syslog pattern
SYSLOG_PATTERN = re.compile(
    r"^(?P<timestamp>(?:(?:\w{3}\s+\d+\s+\d{2}:\d{2}:\d{2})|(?:\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)))\s+(?P<host>\S+)\s+(?P<process>\S+?)(?:\[(?P<pid>\d+)\])?:?\s+(?P<message>.*)$"
)

# SSH Auth log pattern
SSH_AUTH_PATTERN = re.compile(
    r"^(?:(?P<timestamp>\w{3}\s+\d+\s+\d{2}:\d{2}:\d{2}|\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)\s+)?(?:(?P<host>\S+)\s+)?(?:sshd\[\d+\]:\s+)?(?P<status>Failed|Accepted|Invalid user|Failed password)\s+(?:password\s+)?for\s+(?:invalid\s+user\s+)?(?P<user>\S+)\s+from\s+(?P<ip>\d+\.\d+\.\d+\.\d+)(?:\s+port\s+(?P<port>\d+))?"
)

# Firewall log pattern (e.g., iptables / UFW)
FIREWALL_PATTERN = re.compile(
    r"(?:(?P<timestamp>\w{3}\s+\d+\s+\d{2}:\d{2}:\d{2}|\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2})\s+)?.*?(?:IN=(?P<in_iface>\S*)\s+OUT=(?P<out_iface>\S*)\s+)?SRC=(?P<ip>\d+\.\d+\.\d+\.\d+)\s+DST=(?P<dst_ip>\d+\.\d+\.\d+\.\d+).*?PROTO=(?P<proto>\S+)(?:.*?SPT=(?P<spt>\d+)\s+DPT=(?P<dpt>\d+))?"
)


def parse_log_timestamp(ts_val: Any) -> Optional[datetime]:
    """
    Normalizes diverse log timestamp strings/numbers into timezone-aware UTC datetime objects.
    """
    if not ts_val:
        return None
    if isinstance(ts_val, datetime):
        return ts_val if ts_val.tzinfo else ts_val.replace(tzinfo=timezone.utc)
    if isinstance(ts_val, (int, float)):
        try:
            return datetime.fromtimestamp(ts_val, timezone.utc)
        except Exception:
            return None

    ts_str = str(ts_val).strip()
    if not ts_str:
        return None

    # Try ISO format
    try:
        dt = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
        return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
    except Exception:
        pass

    # Common log formats
    formats = [
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d %H:%M:%S.%f",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%dT%H:%M:%S.%f",
        "%b %d %H:%M:%S",
        "%b  %d %H:%M:%S",
        "%d/%b/%Y:%H:%M:%S %z",
        "%d/%b/%Y:%H:%M:%S",
        "%Y/%m/%d %H:%M:%S",
    ]
    for fmt in formats:
        try:
            dt = datetime.strptime(ts_str, fmt)
            if fmt.startswith("%b"):
                dt = dt.replace(year=datetime.now(timezone.utc).year)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt
        except Exception:
            continue

    return None


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
        ts_dt = parse_log_timestamp(d.get("timestamp")) or parse_log_timestamp(TIMESTAMP_PATTERN.search(line).group(0) if TIMESTAMP_PATTERN.search(line) else None)
        return {
            "log_type": "syslog_auth",
            "timestamp": ts_dt.isoformat() if ts_dt else datetime.now(timezone.utc).isoformat(),
            "datetime": ts_dt,
            "ip": d.get("ip"),
            "user": d.get("user", "unknown"),
            "status": status_clean,
            "port": int(d.get("port", 22)) if d.get("port") else 22,
            "host": d.get("host") or "auth.internal.corp",
            "destination": d.get("host") or "auth.internal.corp",
            "destination_ip": "10.0.0.1",
            "raw": line
        }

    # Check Apache / Nginx Web Log
    web_match = WEB_LOG_PATTERN.search(line)
    if web_match:
        d = web_match.groupdict()
        status_code = int(d["status"])
        status_str = "Failed" if status_code >= 400 else "Accepted"
        ts_dt = parse_log_timestamp(d.get("timestamp"))
        return {
            "log_type": "web_access",
            "timestamp": ts_dt.isoformat() if ts_dt else datetime.now(timezone.utc).isoformat(),
            "datetime": ts_dt,
            "ip": d["ip"],
            "user": d["user"] if d["user"] != "-" else "anonymous",
            "path": d["path"],
            "method": d["method"],
            "status": status_str,
            "status_code": status_code,
            "port": 443 if "https" in d.get("path", "") else 80,
            "destination": "web.internal.corp",
            "destination_ip": "10.0.0.2",
            "raw": line
        }

    # Check Firewall Log
    fw_match = FIREWALL_PATTERN.search(line)
    if fw_match:
        d = fw_match.groupdict()
        ts_dt = parse_log_timestamp(d.get("timestamp"))
        dpt = int(d.get("dpt", 0)) if d.get("dpt") else 0
        return {
            "log_type": "firewall",
            "timestamp": ts_dt.isoformat() if ts_dt else datetime.now(timezone.utc).isoformat(),
            "datetime": ts_dt,
            "ip": d["ip"],
            "dst_ip": d.get("dst_ip") or "10.0.0.1",
            "destination_ip": d.get("dst_ip") or "10.0.0.1",
            "proto": d.get("proto", "TCP"),
            "port": dpt,
            "destination_port": dpt,
            "user": "network",
            "status": "Blocked" if any(w in line.upper() for w in ["BLOCK", "DROP", "DENY"]) else "Allowed",
            "raw": line
        }

    # Standard Syslog Fallback
    syslog_match = SYSLOG_PATTERN.search(line)
    if syslog_match:
        d = syslog_match.groupdict()
        ips = IP_PATTERN.findall(line)
        ip = ips[0] if ips else "127.0.0.1"
        ts_dt = parse_log_timestamp(d.get("timestamp"))
        status = "Failed" if any(w in line.lower() for w in ["fail", "error", "deny", "invalid", "unauthorized", "refused"]) else "Success"
        return {
            "log_type": "syslog",
            "timestamp": ts_dt.isoformat() if ts_dt else datetime.now(timezone.utc).isoformat(),
            "datetime": ts_dt,
            "host": d.get("host") or "server-01.corp.internal",
            "destination": d.get("host") or "server-01.corp.internal",
            "process": d.get("process"),
            "ip": ip,
            "status": status,
            "user": "root" if "root" in line else "user",
            "port": 22,
            "raw": line
        }

    # Generic Fallback Regex extraction
    ips = IP_PATTERN.findall(line)
    if ips:
        ts_match = TIMESTAMP_PATTERN.search(line)
        ts_dt = parse_log_timestamp(ts_match.group(0)) if ts_match else None
        status = "Failed" if any(w in line.lower() for w in ["fail", "error", "deny", "refused", "invalid", "block"]) else "Success"
        return {
            "log_type": "generic_text",
            "timestamp": ts_dt.isoformat() if ts_dt else datetime.now(timezone.utc).isoformat(),
            "datetime": ts_dt,
            "ip": ips[0],
            "status": status,
            "user": "unknown",
            "port": 22,
            "raw": line
        }

    return None


def parse_json_log(content: str) -> List[Dict[str, Any]]:
    """
    Parses JSON log string (single JSON object, JSON array, or newline-delimited JSON).
    Handles Wazuh, Suricata, Sysmon JSON, Defender/CrowdStrike JSON, and SOC VIGIL schema.
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

        ip = (
            item.get("source_ip") or
            item.get("src_ip") or
            item.get("ip") or
            item.get("ClientIP") or
            item.get("src_ip_addr") or
            (item.get("data", {}).get("srcip") if isinstance(item.get("data"), dict) else None)
        )
        if not ip:
            ips = IP_PATTERN.findall(json.dumps(item))
            ip = ips[0] if ips else "127.0.0.1"

        dst_ip = (
            item.get("destination_ip") or
            item.get("dst_ip") or
            item.get("target_ip") or
            "10.0.0.1"
        )

        user = (
            item.get("username") or
            item.get("user") or
            item.get("user_name") or
            item.get("AccountName") or
            item.get("account") or
            (item.get("data", {}).get("dstuser") if isinstance(item.get("data"), dict) else None)
        ) or "unknown"

        # Check status / success flag
        status_val = item.get("status") or item.get("action") or item.get("result") or item.get("event_type") or ""
        if "success" in item:
            status = "Success" if item["success"] is True or str(item["success"]).lower() in ["true", "1", "yes"] else "Failed"
        else:
            status_raw = str(status_val).lower()
            status = "Failed" if any(w in status_raw for w in ["fail", "deny", "block", "drop", "invalid", "error"]) else "Success"

        port_val = item.get("destination_port") or item.get("dst_port") or item.get("port") or item.get("target_port") or 22
        try:
            port_num = int(port_val)
        except Exception:
            port_num = 22

        ts_raw = item.get("timestamp") or item.get("time") or item.get("datetime") or item.get("EventTime") or item.get("@timestamp")
        ts_dt = parse_log_timestamp(ts_raw)

        lat = item.get("latitude") or item.get("lat")
        lon = item.get("longitude") or item.get("lon")

        results.append({
            "log_type": item.get("event_type") or item.get("log_type") or "json_event",
            "timestamp": ts_dt.isoformat() if ts_dt else datetime.now(timezone.utc).isoformat(),
            "datetime": ts_dt,
            "ip": ip,
            "source_ip": ip,
            "destination_ip": dst_ip,
            "destination": item.get("destination") or item.get("host") or dst_ip,
            "user": user,
            "status": status,
            "port": port_num,
            "latitude": float(lat) if lat is not None else None,
            "longitude": float(lon) if lon is not None else None,
            "raw": json.dumps(item)
        })

    return results


def parse_csv_log(content: str) -> List[Dict[str, Any]]:
    """
    Parses CSV log content (CrowdStrike export, Defender export, Firewall CSV, schema CSV).
    Supported schema headers: timestamp,source_ip,username,destination_ip,destination_port,event_type,success
    """
    results = []
    reader = csv.DictReader(io.StringIO(content))
    for row in reader:
        ip = "127.0.0.1"
        dst_ip = "10.0.0.1"
        user = "unknown"
        status = "Success"
        port = 22
        ts_raw = None
        lat = None
        lon = None

        for k, v in row.items():
            if not k or v is None:
                continue
            key_lower = k.lower().strip()
            val_str = str(v).strip()

            if key_lower in ["timestamp", "time", "datetime", "date", "event_time", "created_at"]:
                ts_raw = val_str
            elif key_lower in ["source_ip", "src_ip", "src", "ip", "client_ip"]:
                match = IP_PATTERN.search(val_str)
                if match:
                    ip = match.group(0)
            elif key_lower in ["destination_ip", "dst_ip", "dst", "target_ip"]:
                match = IP_PATTERN.search(val_str)
                if match:
                    dst_ip = match.group(0)
            elif key_lower in ["username", "user", "account", "user_name", "account_name"]:
                user = val_str
            elif key_lower in ["destination_port", "dst_port", "port", "dpt"]:
                try:
                    port = int(val_str)
                except Exception:
                    pass
            elif key_lower in ["success", "successful"]:
                status = "Success" if val_str.lower() in ["true", "1", "yes", "success"] else "Failed"
            elif key_lower in ["status", "action", "outcome", "result"]:
                status = "Failed" if any(w in val_str.lower() for w in ["fail", "block", "deny", "drop", "error", "invalid"]) else "Success"
            elif key_lower in ["latitude", "lat"]:
                try:
                    lat = float(val_str)
                except Exception:
                    pass
            elif key_lower in ["longitude", "lon", "lng"]:
                try:
                    lon = float(val_str)
                except Exception:
                    pass

        ts_dt = parse_log_timestamp(ts_raw)

        results.append({
            "log_type": "csv_export",
            "timestamp": ts_dt.isoformat() if ts_dt else datetime.now(timezone.utc).isoformat(),
            "datetime": ts_dt,
            "ip": ip,
            "source_ip": ip,
            "destination_ip": dst_ip,
            "destination": dst_ip,
            "user": user,
            "status": status,
            "port": port,
            "latitude": lat,
            "longitude": lon,
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
        return parse_content(content, filename=os.path.basename(file_path))
    except Exception as e:
        print(f"[LogParser Error] Failed reading file {file_path}: {e}")
        return []


def parse_content(content: str, filename: str = "") -> List[Dict[str, Any]]:
    """
    Parses raw string content uploaded via frontend drag-and-drop or API.
    """
    filename_lower = filename.lower()
    first_line = content.strip().splitlines()[0] if content.strip().splitlines() else ""
    if filename_lower.endswith(".json") or content.strip().startswith(("{", "[")):
        return parse_json_log(content)
    elif filename_lower.endswith(".csv") or ("," in first_line and not first_line.startswith("Mar") and not first_line.startswith("Feb")):
        return parse_csv_log(content)
    else:
        logs = []
        for line in content.splitlines():
            parsed = parse_single_line(line)
            if parsed:
                logs.append(parsed)
        return logs