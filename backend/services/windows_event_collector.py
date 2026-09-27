import sys
import os
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional

try:
    import win32evtlog
    import win32evtlogutil
    import win32con
    import winerror
    HAS_WIN32EVTLOG = True
except ImportError:
    HAS_WIN32EVTLOG = False


class WindowsEventCollector:
    """
    Collects genuine Windows Security Event Log entries from the local Windows machine:
    - Event ID 4625: Failed Logon (Audit Failure)
    - Event ID 4624: Successful Logon (Audit Success)
    """

    def __init__(self, server: Optional[str] = None):
        self.server = server
        self.log_type = "Security"

    def is_available(self) -> bool:
        return sys.platform.startswith("win") and HAS_WIN32EVTLOG

    def collect_events(self, max_records: int = 200, lookback_minutes: int = 1440) -> Dict[str, Any]:
        """
        Reads real Windows Security Event Log records.
        Returns a dictionary with parsed events and status message.
        """
        if not self.is_available():
            return {
                "status": "unavailable",
                "message": "Windows Event Log collector is only available on Windows environments with pywin32.",
                "events": []
            }

        events: List[Dict[str, Any]] = []
        cutoff_time = datetime.now(timezone.utc) - timedelta(minutes=lookback_minutes)

        try:
            hand = win32evtlog.OpenEventLog(self.server, self.log_type)
            flags = win32evtlog.EVENTLOG_BACKWARDS_READ | win32evtlog.EVENTLOG_SEQUENTIAL_READ

            record_count = 0
            while record_count < max_records:
                records = win32evtlog.ReadEventLog(hand, flags, 0)
                if not records:
                    break

                for rec in records:
                    record_count += 1
                    event_id = rec.EventID & 0xFFFF
                    time_gen = rec.TimeGenerated
                    if time_gen.tzinfo is None:
                        time_gen = time_gen.replace(tzinfo=timezone.utc)

                    if time_gen < cutoff_time:
                        break

                    # Filter for Logon / Authentication events (4625 = Failed, 4624 = Success)
                    if event_id in (4625, 4624):
                        status = "Failed" if event_id == 4625 else "Success"
                        strings = rec.StringInserts or []

                        # Event 4625/4624 StringInserts layout:
                        # Index 5: TargetUserName, Index 6: TargetDomainName
                        # Index 18/19: IpAddress / WorkstationName
                        user = "unknown"
                        ip = "127.0.0.1"
                        port = 445

                        if len(strings) > 5 and strings[5]:
                            user = strings[5]
                        elif len(strings) > 1 and strings[1]:
                            user = strings[1]

                        # Look for IP address in string inserts
                        for s in strings:
                            if s and s != "-" and ("." in s or ":" in s):
                                parts = s.split(".")
                                if len(parts) == 4 and all(p.isdigit() for p in parts):
                                    ip = s
                                    break

                        raw_msg = f"Windows Security Event {event_id} ({status} Logon for {user} from {ip})"

                        events.append({
                            "log_type": f"windows_event_{event_id}",
                            "timestamp": time_gen.isoformat(),
                            "datetime": time_gen,
                            "ip": ip,
                            "source_ip": ip,
                            "user": user,
                            "status": status,
                            "port": port,
                            "host": rec.SourceName or "WindowsHost",
                            "destination": "LocalHost",
                            "destination_ip": "127.0.0.1",
                            "raw": raw_msg
                        })

                if time_gen < cutoff_time or record_count >= max_records:
                    break

            win32evtlog.CloseEventLog(hand)

            return {
                "status": "success",
                "message": f"Successfully retrieved {len(events)} genuine Windows Security events.",
                "events": events
            }

        except Exception as e:
            err_msg = str(e)
            if "Access is denied" in err_msg or "error: 5" in err_msg:
                message = "Windows Security Event Log requires elevated (Administrator) permissions to read. Running in unprivileged mode."
            else:
                message = f"Windows Event Log query status: {err_msg}"

            return {
                "status": "restricted",
                "message": message,
                "events": []
            }
