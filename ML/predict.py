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
import warnings
import joblib
import pandas as pd

warnings.filterwarnings("ignore")

# ==========================================================
# Configuration
# ==========================================================

MODEL_PATH = "models/best_model.pkl"
ENCODER_PATH = "models/label_encoder.pkl"
FEATURE_PATH = "models/feature_names.txt"

DATASET_PATH = "data/ml_dataset.csv"
INPUT_FILE = "data/new_network_data.csv"
OUTPUT_FILE = "data/prediction_results.csv"

# ==========================================================
# Helper Function
# ==========================================================

def section(title):
    print("\n" + "=" * 70)
    print(title)
    print("=" * 70)

# ==========================================================
# Check Required Files
# ==========================================================

section("Checking Required Files")

required_files = [
    MODEL_PATH,
    ENCODER_PATH,
    FEATURE_PATH,
    DATASET_PATH
]

for file in required_files:
    if not os.path.exists(file):
        raise FileNotFoundError(f"\nRequired file not found:\n{file}")

print("All Required Files Found")

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

with open(FEATURE_PATH, "r") as f:
    feature_names = [line.strip() for line in f.readlines()]

print(f"Total Features : {len(feature_names)}")

# ==========================================================
# Create Sample File Automatically
# ==========================================================

section("Checking Prediction Dataset")

if not os.path.exists(INPUT_FILE):

    print("new_network_data.csv not found.")
    print("Creating sample prediction dataset...")

    df = pd.read_csv(DATASET_PATH)

    if "Label" in df.columns:
        df = df.drop(columns=["Label"])

    sample = df.sample(
        n=100,
        random_state=42
    )

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

    print("\nMissing Columns")

    for col in missing:
        print(col)

    raise Exception("\nPrediction Stopped.")

print("All Features Available")

# Arrange columns in training order
X = data[feature_names]

# ==========================================================
# Predict
# ==========================================================

section("Running Prediction")

predictions = model.predict(X)

predicted_labels = label_encoder.inverse_transform(predictions)

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

print(summary)

# ==========================================================
# Finish
# ==========================================================

section("Prediction Completed")

print("Prediction File Created Successfully")
print("Done.")