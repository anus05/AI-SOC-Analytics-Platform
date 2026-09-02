import json
import os


class ReportGenerator:

    def __init__(self, output_dir=None):
        if output_dir:
            self.output_dir = output_dir
        else:
            # Anchor to workspace reports directory
            base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
            self.output_dir = os.path.join(base_dir, "reports")

        os.makedirs(self.output_dir, exist_ok=True)

    def generate_json(self, alerts):
        data = []
        for alert in alerts:
            if hasattr(alert, "to_dict"):
                data.append(alert.to_dict())
            elif isinstance(alert, dict):
                data.append(alert)

        file_path = os.path.join(self.output_dir, "alerts.json")
        with open(file_path, "w", encoding="utf-8") as file:
            json.dump(data, file, indent=4)

        print("[+] Report Generated Successfully")
        print("[+] Location :", file_path)
        return file_path