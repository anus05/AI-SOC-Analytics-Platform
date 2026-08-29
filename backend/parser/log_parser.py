import re

pattern = re.compile(
    r"^(?P<month>\w+)\s+"
    r"(?P<day>\d+)\s+"
    r"(?P<time>\d+:\d+:\d+).*?"
    r"(?P<status>Failed|Accepted).*?"
    r"for\s+(?P<user>\S+)\s+"
    r"from\s+(?P<ip>\d+\.\d+\.\d+\.\d+)"
    r".*?port\s+(?P<port>\d+)"
    r"\s+(?P<protocol>\S+)$"
)

def parse_log(line):
    match = pattern.search(line)

    if not match:
        return None

    data = match.groupdict()

    return {
        "time": f"{data['month']} {data['day']} {data['time']}",
        "user": data["user"],
        "status": data["status"],
        "ip": data["ip"],
        "port": int(data["port"])
    }
def parse_file(path):

    logs = []

    with open(path, "r") as file:

        for line in file:

            log = parse_log(line)

            if log:

                logs.append(log)

    return logs
if __name__ == "__main__":
    with open("../logs/auth.log", "r") as f:
        for line in f:
            result = parse_log(line)
            if result:
                print(result)