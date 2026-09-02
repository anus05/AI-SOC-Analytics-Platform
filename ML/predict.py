"""
===========================================================
AI-Powered SOC Analytics & Threat Detection Platform
Prediction Module
===========================================================
"""

# ==========================================================
# Import Libraries
# ==========================================================

import os
import sys
import warnings
import joblib
import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")

# ==========================================================
# Dynamic Path Resolution
# ==========================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def resolve_path(rel_path):
    if os.path.exists(rel_path):
        return os.path.abspath(rel_path)
    from_base = os.path.join(BASE_DIR, rel_path)
    if os.path.exists(from_base):
        return os.path.abspath(from_base)
    return os.path.abspath(from_base)


MODEL_PATH = resolve_path("models/best_model.pkl")
ENCODER_PATH = resolve_path("models/label_encoder.pkl")
FEATURE_PATH = resolve_path("models/feature_names.txt")

DATASET_PATH = resolve_path("data/ml_dataset.csv")
INPUT_FILE = resolve_path("data/new_network_data.csv")
OUTPUT_FILE = resolve_path("data/prediction_results.csv")

# ==========================================================
# Helper Function
# ==========================================================


def section(title):
    print("\n" + "=" * 70)
    print(title)
    print("=" * 70)


def safe_print(msg):
    try:
        print(msg)
    except UnicodeEncodeError:
        print(str(msg).encode("ascii", "replace").decode("ascii"))


# ==========================================================
# Check Required Files
# ==========================================================

section("Checking Required Files")

required_files = [
    MODEL_PATH,
    ENCODER_PATH,
    FEATURE_PATH
]

for file in required_files:
    if not os.path.exists(file):
        raise FileNotFoundError(f"\nRequired file not found:\n{file}")

print("All Core Model Files Found")

# ==========================================================
# Load Model
# ==========================================================

section("Loading Model")

model = joblib.load(MODEL_PATH)
label_encoder = joblib.load(ENCODER_PATH)

print("Model Loaded Successfully")
print("Label Encoder Loaded Successfully")

# ==========================================================
# Load Feature Names
# ==========================================================

with open(FEATURE_PATH, "r", encoding="utf-8", errors="ignore") as f:
    feature_names = [line.strip() for line in f.readlines() if line.strip()]

print(f"Total Features : {len(feature_names)}")

# ==========================================================
# Create Sample File Automatically if not present
# ==========================================================

section("Checking Prediction Dataset")

os.makedirs(os.path.dirname(INPUT_FILE), exist_ok=True)

if not os.path.exists(INPUT_FILE):
    print("new_network_data.csv not found.")
    print("Creating sample prediction dataset...")

    if os.path.exists(DATASET_PATH):
        df = pd.read_csv(DATASET_PATH)
        if "Label" in df.columns:
            df = df.drop(columns=["Label"])
        sample = df.sample(
            n=min(100, len(df)),
            random_state=42
        )
    else:
        # Generate synthetic realistic network telemetry data for testing
        np.random.seed(42)
        sample_data = {
            col: np.random.uniform(0, 100, size=50) for col in feature_names
        }
        sample = pd.DataFrame(sample_data)

    sample.to_csv(INPUT_FILE, index=False)
    print("Sample Dataset Created Successfully")
else:
    print("Prediction Dataset Found")

# ==========================================================
# Load Prediction Dataset
# ==========================================================

section("Loading Prediction Dataset")

data = pd.read_csv(INPUT_FILE)

print("Dataset Loaded")
print("Shape :", data.shape)

# ==========================================================
# Validate Features
# ==========================================================

section("Validating Features")

missing = [
    col
    for col in feature_names
    if col not in data.columns
]

if len(missing) > 0:
    print("\nMissing Columns:")
    for col in missing:
        print(col)
    raise Exception("\nPrediction Stopped due to missing features.")

print("All Features Available")

# Arrange columns in training order
X = data[feature_names]

# ==========================================================
# Predict
# ==========================================================

section("Running Prediction")

predictions = model.predict(X)

# Clean labels for safe encoding
clean_classes = [
    str(c).encode("ascii", "replace").decode("ascii")
    for c in label_encoder.classes_
]

predicted_indices = predictions
predicted_labels = [clean_classes[i] if i < len(clean_classes) else f"Class_{i}" for i in predicted_indices]

data["Predicted_Label"] = predicted_labels

print("Prediction Completed Successfully")

# ==========================================================
# Save Output
# ==========================================================

data.to_csv(
    OUTPUT_FILE,
    index=False
)

print(f"\nPrediction Results Saved : {OUTPUT_FILE}")

# ==========================================================
# Prediction Summary
# ==========================================================

section("Prediction Summary")

summary = data["Predicted_Label"].value_counts()
safe_print(summary.to_string())

# ==========================================================
# Finish
# ==========================================================

section("Prediction Completed")

print("Prediction File Created Successfully")
print("Done.")