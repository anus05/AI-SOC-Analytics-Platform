from backend.detectors.brute_force_detector import BruteForceDetector


class DetectionService:

    def __init__(self):
        self.detectors = [
            BruteForceDetector()
        ]

    def detect(self, logs):
        alerts = []

        for detector in self.detectors:
            detector_alerts = detector.detect(logs)

            if detector_alerts:
                alerts.extend(detector_alerts)

        return alerts