"""
===========================================================
AI-Powered SOC Analytics & Threat Detection Platform
Machine Learning Model Training
===========================================================
"""

# ==========================================================
# Import Libraries
# ==========================================================

import os
import warnings
import pandas as pd

from sklearn.model_selection import train_test_split

warnings.filterwarnings("ignore")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def resolve_path(rel_path):
    if os.path.isabs(rel_path) and os.path.exists(rel_path):
        return rel_path
    candidates = [
        rel_path,
        os.path.join(BASE_DIR, rel_path),
        os.path.join(BASE_DIR, "..", rel_path)
    ]
    for c in candidates:
        if os.path.exists(c):
            return os.path.abspath(c)
    return os.path.abspath(os.path.join(BASE_DIR, rel_path))


DATA_PATH = resolve_path("data/ml_dataset.csv")
MODEL_DIR = resolve_path("models")
REPORT_DIR = resolve_path("reports")

os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(REPORT_DIR, exist_ok=True)

# ==========================================================
# Helper Function
# ==========================================================


def section(title):
    print("\n" + "=" * 70)
    print(title)
    print("=" * 70)


# ==========================================================
# Load Dataset
# ==========================================================

section("Loading Dataset")

if not os.path.exists(DATA_PATH):
    print(f"[!] Dataset not found at {DATA_PATH}. Please run preprocessing first.")
    exit(0)

df = pd.read_csv(DATA_PATH)

print("Dataset Loaded Successfully")

print("Shape :", df.shape)


# ==========================================================
# Split Features and Target
# ==========================================================

section("Preparing Features")

X = df.drop("Label", axis=1)

y = df["Label"]

print("Features :", X.shape)

print("Target :", y.shape)

# ==========================================================
# Train Test Split
# ==========================================================

section("Train Test Split")

X_train, X_test, y_train, y_test = train_test_split(

    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y

)

print("Training Samples :", X_train.shape)

print("Testing Samples :", X_test.shape)

# ==========================================================
# Save Information
# ==========================================================

with open(os.path.join(REPORT_DIR, "model_report.txt"), "w") as f:

    f.write("MODEL TRAINING REPORT\n")
    f.write("=" * 50 + "\n\n")
    f.write(f"Dataset Shape : {df.shape}\n")
    f.write(f"Training Samples : {X_train.shape}\n")
    f.write(f"Testing Samples : {X_test.shape}\n")

section("PART 1 COMPLETED")

# ==========================================================
# PART 2 : MODEL TRAINING
# ==========================================================

import time
import joblib

from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score
)

section("PART 2 : MODEL TRAINING")

# ==========================================================
# Create Smaller Training Sample
# ==========================================================

section("Creating Stratified Training Sample")

# Use 15% of training data for faster model development
X_train_sample, _, y_train_sample, _ = train_test_split(
    X_train,
    y_train,
    train_size=0.15,
    stratify=y_train,
    random_state=42
)

print(f"Original Training Samples : {X_train.shape[0]:,}")
print(f"Sample Training Samples   : {X_train_sample.shape[0]:,}")

# ==========================================================
# Dictionary to Store Results
# ==========================================================

results = {}

# ==========================================================
# Helper Function
# ==========================================================

def evaluate_model(model, model_name):

    print("\n" + "=" * 70)
    print(f"Training {model_name}")
    print("=" * 70)

    start = time.time()

    model.fit(X_train_sample, y_train_sample)

    end = time.time()

    y_pred = model.predict(X_test)

    accuracy = accuracy_score(y_test, y_pred)

    precision = precision_score(
        y_test,
        y_pred,
        average="weighted",
        zero_division=0
    )

    recall = recall_score(
        y_test,
        y_pred,
        average="weighted",
        zero_division=0
    )

    f1 = f1_score(
        y_test,
        y_pred,
        average="weighted",
        zero_division=0
    )

    print(f"Training Time : {end-start:.2f} seconds")
    print(f"Accuracy      : {accuracy:.4f}")
    print(f"Precision     : {precision:.4f}")
    print(f"Recall        : {recall:.4f}")
    print(f"F1 Score      : {f1:.4f}")

    results[model_name] = {
        "model": model,
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1
    }

# ==========================================================
# Decision Tree
# ==========================================================

decision_tree = DecisionTreeClassifier(
    random_state=42
)

evaluate_model(
    decision_tree,
    "Decision Tree"
)

# ==========================================================
# Random Forest
# ==========================================================

random_forest = RandomForestClassifier(
    n_estimators=50,
    random_state=42,
    n_jobs=-1
)

evaluate_model(
    random_forest,
    "Random Forest"
)

# ==========================================================
# Select Best Model
# ==========================================================

section("Selecting Best Model")

best_model_name = max(
    results,
    key=lambda x: results[x]["accuracy"]
)

best_model = results[best_model_name]["model"]

print(f"Best Model : {best_model_name}")
print(f"Best Accuracy : {results[best_model_name]['accuracy']:.4f}")

# ==========================================================
# Save Best Model
# ==========================================================

joblib.dump(
    best_model,
    os.path.join(MODEL_DIR, "best_model.pkl")
)

print("Best Model Saved Successfully")

# ==========================================================
# Save Report
# ==========================================================

report_path = os.path.join(REPORT_DIR, "model_report.txt")

with open(report_path, "a") as report:

    report.write("\n")
    report.write("=" * 60 + "\n")
    report.write("MODEL PERFORMANCE\n")
    report.write("=" * 60 + "\n\n")

    for model_name, result in results.items():

        report.write(f"{model_name}\n")
        report.write(f"Accuracy : {result['accuracy']:.4f}\n")
        report.write(f"Precision : {result['precision']:.4f}\n")
        report.write(f"Recall : {result['recall']:.4f}\n")
        report.write(f"F1 Score : {result['f1']:.4f}\n")
        report.write("\n")

print("Model Report Saved Successfully")

section("PART 2 COMPLETED")

# ==========================================================
# PART 3 : MODEL EVALUATION
# ==========================================================

import matplotlib.pyplot as plt

from sklearn.metrics import (
    confusion_matrix,
    ConfusionMatrixDisplay,
    classification_report
)

section("PART 3 : MODEL EVALUATION")

PLOT_DIR = "plots"

os.makedirs(PLOT_DIR, exist_ok=True)

# ==========================================================
# Prediction using Best Model
# ==========================================================

y_pred = best_model.predict(X_test)

# ==========================================================
# Classification Report
# ==========================================================

section("Classification Report")

report = classification_report(
    y_test,
    y_pred,
    zero_division=0
)

print(report)

with open(
    os.path.join(REPORT_DIR, "classification_report.txt"),
    "w"
) as f:

    f.write(report)

print("Classification Report Saved")

# ==========================================================
# Confusion Matrix
# ==========================================================

section("Confusion Matrix")

cm = confusion_matrix(
    y_test,
    y_pred
)

disp = ConfusionMatrixDisplay(confusion_matrix=cm)

plt.figure(figsize=(12,10))

disp.plot()

plt.title("Random Forest Confusion Matrix")

plt.savefig(
    os.path.join(
        PLOT_DIR,
        "confusion_matrix.png"
    )
)

plt.close()

print("Confusion Matrix Saved")

# ==========================================================
# Accuracy Comparison
# ==========================================================

section("Model Comparison")

model_names = list(results.keys())

accuracies = [
    results[m]["accuracy"]
    for m in model_names
]

plt.figure(figsize=(8,5))

plt.bar(
    model_names,
    accuracies
)

plt.ylabel("Accuracy")

plt.title("Model Accuracy Comparison")

plt.savefig(
    os.path.join(
        PLOT_DIR,
        "model_accuracy.png"
    )
)

plt.close()

print("Accuracy Comparison Saved")

section("TRAINING COMPLETED SUCCESSFULLY")