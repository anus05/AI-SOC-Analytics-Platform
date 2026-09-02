"""
===========================================================
AI-Powered SOC Analytics & Threat Detection Platform
Exploratory Data Analysis (EDA)
===========================================================
"""

import os
import warnings

import matplotlib.pyplot as plt
import pandas as pd

warnings.filterwarnings("ignore")

# ==========================================================
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
PLOT_DIR = resolve_path("plots")

os.makedirs(PLOT_DIR, exist_ok=True)

# ==========================================================
# Load Dataset
# ==========================================================

print("=" * 60)
print("Loading Dataset")
print("=" * 60)

if not os.path.exists(DATA_PATH):
    print(f"[!] Dataset not found at {DATA_PATH}. Please run preprocessing first.")
    exit(0)

df = pd.read_csv(DATA_PATH)

print("Dataset Loaded Successfully\n")


# ==========================================================
# Dataset Information
# ==========================================================

print("=" * 60)
print("Dataset Information")
print("=" * 60)

print("Shape :", df.shape)

print("\nData Types\n")

print(df.dtypes.value_counts())

print("\nMissing Values")

print(df.isnull().sum().sum())

# ==========================================================
# Summary Statistics
# ==========================================================

print("=" * 60)
print("Summary Statistics")
print("=" * 60)

print(df.describe())

# ==========================================================
# Class Distribution
# ==========================================================

print("=" * 60)
print("Attack Distribution")
print("=" * 60)

counts = df["Label"].value_counts().sort_index()

print(counts)

plt.figure(figsize=(10, 6))

counts.plot(kind="bar")

plt.title("Attack Class Distribution")

plt.xlabel("Encoded Label")

plt.ylabel("Count")

plt.tight_layout()

plt.savefig(os.path.join(PLOT_DIR, "class_distribution.png"))

plt.close()

print("Saved : class_distribution.png")

# ==========================================================
# Correlation Heatmap
# ==========================================================

print("=" * 60)
print("Correlation Heatmap")
print("=" * 60)

corr = df.corr(numeric_only=True)

plt.figure(figsize=(15, 12))

plt.imshow(corr, aspect="auto")

plt.colorbar()

plt.title("Correlation Heatmap")

plt.tight_layout()

plt.savefig(os.path.join(PLOT_DIR, "correlation_heatmap.png"))

plt.close()

print("Saved : correlation_heatmap.png")

# ==========================================================
# Top Correlated Features
# ==========================================================

print("=" * 60)
print("Top Correlated Features with Label")
print("=" * 60)

corr_label = corr["Label"].drop("Label")

top = corr_label.abs().sort_values(ascending=False).head(10)

print(top)

plt.figure(figsize=(10, 6))

top.plot(kind="bar")

plt.title("Top Features Correlated with Label")

plt.tight_layout()

plt.savefig(os.path.join(PLOT_DIR, "top_correlated_features.png"))

plt.close()

print("Saved : top_correlated_features.png")

# ==========================================================
# Completed
# ==========================================================

print("=" * 60)
print("EDA COMPLETED SUCCESSFULLY")
print("=" * 60)