import json
import os


class ReportGenerator:

    def __init__(self):
        self.output_dir = "../reports"

        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)

    def generate_json(self, alerts):

        data = []

        for alert in alerts:
            data.append(alert.to_dict())

        with open(
            os.path.join(self.output_dir, "alerts.json"),
            "w",
            encoding="utf-8"
        ) as file:

            json.dump(data, file, indent=4)

        print("\n Report Generated Successfully")
        print("Location :", os.path.join(self.output_dir, "alerts.json"))