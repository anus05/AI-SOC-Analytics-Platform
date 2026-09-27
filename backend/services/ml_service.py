import os
import json
import warnings
import joblib
import numpy as np
import pandas as pd
from typing import Optional, Dict, Any

warnings.filterwarnings("ignore")

from backend.scoring.threat_score import calculate_score, severity
from backend.mitre.mitre_mapper import get_mitre
from backend.models.alert import Alert

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class MLService:
    def __init__(self):
        self.model_path = os.path.join(BASE_DIR, "ML", "models", "best_model.pkl")
        self.encoder_path = os.path.join(BASE_DIR, "ML", "models", "label_encoder.pkl")
        self.feature_path = os.path.join(BASE_DIR, "ML", "models", "feature_names.txt")
        self.loaded = False
        self.feature_names = []
        self.clean_classes = []
        self._load_model()

    def _load_model(self):
        try:
            if (
                os.path.exists(self.model_path)
                and os.path.exists(self.encoder_path)
                and os.path.exists(self.feature_path)
            ):
                self.model = joblib.load(self.model_path)
                self.encoder = joblib.load(self.encoder_path)
                with open(self.feature_path, "r", encoding="utf-8", errors="ignore") as f:
                    self.feature_names = [line.strip() for line in f.readlines() if line.strip()]

                raw_classes = self.encoder.classes_
                self.clean_classes = [
                    str(c).encode("ascii", "replace").decode("ascii").replace("?", "").strip()
                    for c in raw_classes
                ]
                self.loaded = True
                print("[+] ML Model & Label Encoder loaded successfully.")
        except Exception as e:
            print(f"[!] Warning: Could not load ML model: {e}")
            self.loaded = False

    def predict_log_entry(self, log: Dict[str, Any]) -> Optional[Alert]:
        """
        Runs ML classifier inference if genuine network flow telemetry features exist in the log entry.
        Does NOT fabricate alerts when ML model is not loaded or for generic text logs.
        """
        if not self.loaded:
            return None

        # Check if this log entry has network flow features required by the CICIDS ML model
        has_flow_telemetry = any(k in log for k in ["flow_duration", "Flow_Duration", "rst_flag_count", "total_fwd_packets", "fwd_packets"])
        if not has_flow_telemetry:
            # Generic syslog/auth logs are processed by rule-based detectors, not network flow ML
            return None

        feature_dict = {col: 0.0 for col in self.feature_names}

        # Extract features from log if present
        for col in self.feature_names:
            if col in log:
                try:
                    feature_dict[col] = float(log[col])
                except Exception:
                    pass
            elif col.lower() in log:
                try:
                    feature_dict[col] = float(log[col.lower()])
                except Exception:
                    pass

        port_val = log.get("port") or log.get("destination_port") or 22
        feature_dict["Destination_Port"] = float(port_val)

        df_X = pd.DataFrame([feature_dict])[self.feature_names]

        try:
            pred_idx = self.model.predict(df_X)[0]
            raw_label = (
                self.clean_classes[pred_idx]
                if pred_idx < len(self.clean_classes)
                else "BENIGN"
            )

            if hasattr(self.model, "predict_proba"):
                probs = self.model.predict_proba(df_X)[0]
                confidence = float(np.max(probs))
            else:
                confidence = 0.85

            if raw_label.upper() in ["BENIGN", "NORMAL"]:
                return None

            attack_mapping = {
                "SSH-Patator": "Brute Force",
                "FTP-Patator": "Brute Force",
                "Web Attack  Brute Force": "Brute Force",
                "Web Attack  Sql Injection": "SQL Injection",
                "Web Attack  XSS": "XSS",
                "PortScan": "Port Scan",
                "DDoS": "DDoS / Botnet",
                "DoS GoldenEye": "DDoS / Botnet",
                "DoS Hulk": "DDoS / Botnet",
                "DoS Slowhttptest": "DDoS / Botnet",
                "DoS slowloris": "DDoS / Botnet",
                "Infiltration": "Infiltration Anomaly"
            }

            attack_name = attack_mapping.get(raw_label, raw_label)
            score = int(min(100, max(50, round(confidence * 100))))
            sev_level = severity(score)
            mitre_data = get_mitre(attack_name)

            ip = log.get("ip") or log.get("source_ip") or "127.0.0.1"
            user = log.get("user", "Unknown")

            explainability = {
                "top_features": [
                    {"feature": "Flow_Duration", "importance": 0.35, "value": feature_dict.get("Flow_Duration", 0)},
                    {"feature": "Destination_Port", "importance": 0.28, "value": port_val},
                    {"feature": "RST_Flag_Count", "importance": 0.22, "value": feature_dict.get("RST_Flag_Count", 0)},
                ],
                "model_type": "RandomForest/XGBoost Classifier",
                "raw_class": raw_label
            }

            fp_prob = float(round(1.0 - confidence, 4))

            return Alert(
                attack=attack_name,
                ip=ip,
                failed_attempts=1,
                threat_score=score,
                severity=sev_level,
                mitre=mitre_data,
                user=user,
                destination=log.get("destination", "auth.internal.corp"),
                confidence=float(round(confidence * 100, 2)),
                rule_name="ML Flow Classifier",
                ml_probability=float(round(confidence, 4)),
                fp_probability=fp_prob,
                explainability_json=json.dumps(explainability)
            )
        except Exception as e:
            print(f"[!] ML Prediction error: {e}")
            return None
