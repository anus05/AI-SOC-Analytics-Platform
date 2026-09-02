from backend.detectors.brute_force_detector import BruteForceDetector
from backend.detectors.impossible_travel_detector import ImpossibleTravelDetector
from backend.detectors.password_spray_detector import PasswordSprayDetector
from backend.detectors.port_scan_detector import PortScanDetector
from backend.detectors.advanced_detectors import (
    PrivilegeEscalationDetector,
    LateralMovementDetector,
    BeaconingDetector,
    CredentialDumpingDetector,
    SuspiciousPowerShellDetector,
    RansomwareBehaviourDetector,
    LivingOffTheLandDetector,
    ImpossibleLoginHoursDetector,
    AbnormalUserBehaviourDetector,
    RareParentProcessDetector,
    PersistenceTechniquesDetector,
)
from backend.services.ml_service import MLService


class DetectionService:
    def __init__(self):
        self.detectors = [
            BruteForceDetector(),
            PasswordSprayDetector(),
            PortScanDetector(),
            ImpossibleTravelDetector(),
            PrivilegeEscalationDetector(),
            LateralMovementDetector(),
            BeaconingDetector(),
            CredentialDumpingDetector(),
            SuspiciousPowerShellDetector(),
            RansomwareBehaviourDetector(),
            LivingOffTheLandDetector(),
            ImpossibleLoginHoursDetector(),
            AbnormalUserBehaviourDetector(),
            RareParentProcessDetector(),
            PersistenceTechniquesDetector(),
        ]
        self.ml_service = MLService()

    def detect(self, logs):
        alerts = []

        # 1. Rule-based detection across 15 detector rules
        for detector in self.detectors:
            try:
                detector_alerts = detector.detect(logs)
                if detector_alerts:
                    alerts.extend(detector_alerts)
            except Exception as e:
                print(f"[Detector Error] {detector.__class__.__name__}: {e}")

        # 2. ML pipeline prediction for logs
        for log in logs:
            try:
                ml_alert = self.ml_service.predict_log_entry(log)
                if ml_alert:
                    # Avoid duplicate identical alerts
                    if not any(a.ip == ml_alert.ip and a.attack == ml_alert.attack for a in alerts):
                        alerts.append(ml_alert)
            except Exception as e:
                print(f"[ML Service Error] {e}")

        return alerts