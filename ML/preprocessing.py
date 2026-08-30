"""
===========================================================
AI-Powered SOC Analytics & Threat Detection Platform
Module : Data Preprocessing
Author : Team Member 2 (ML & Data Analytics)
===========================================================
"""

# ==========================================================
# Import Libraries
# ==========================================================

import pandas as pd
import numpy as np
import os
import warnings
import time

warnings.filterwarnings("ignore")

# ==========================================================
# Configuration
# ==========================================================

DATA_PATH = "data/merged_dataset.csv"
OUTPUT_PATH = "data/cleaned_dataset.csv"
REPORT_PATH = "reports/preprocessing_report.txt"

# Create reports folder if it doesn't exist
os.makedirs("reports", exist_ok=True)

# ==========================================================
# Helper Function
# ==========================================================

def section(title):
    print("\n" + "="*70)
    print(title)
    print("="*70)


# ==========================================================
# Load Dataset
# ==========================================================

section("Loading Dataset")

start_time = time.time()

try:

    df = pd.read_csv(DATA_PATH)

    print("Dataset Loaded Successfully")

except Exception as e:

    print("Error Loading Dataset")
    print(e)
    exit()

end_time = time.time()

print(f"\nLoading Time : {end_time-start_time:.2f} seconds")

# ==========================================================
# Basic Information
# ==========================================================

section("Dataset Information")

print("Rows :", df.shape[0])
print("Columns :", df.shape[1])

print("\nMemory Usage")

memory = df.memory_usage(deep=True).sum()/1024**2

print(f"{memory:.2f} MB")

print("\nData Types")

print(df.dtypes.value_counts())

# ==========================================================
# Clean Column Names
# ==========================================================

section("Cleaning Column Names")

original_columns = list(df.columns)

df.columns = (
    df.columns
    .str.strip()
    .str.replace(" ", "_")
    .str.replace("/", "_")
    .str.replace("-", "_")
    .str.replace(".", "_", regex=False)
)

print("Column Names Cleaned")

# ==========================================================
# Display First Five Rows
# ==========================================================

section("First Five Rows")

print(df.head())

# ==========================================================
# Check Duplicate Column Names
# ==========================================================

section("Checking Duplicate Columns")

duplicates = df.columns[df.columns.duplicated()]

if len(duplicates) == 0:

    print("No Duplicate Column Names Found")

else:

    print("Duplicate Columns")

    print(duplicates)

# ==========================================================
# Optimize Data Types
# ==========================================================

section("Optimizing Memory")

before = df.memory_usage(deep=True).sum()/1024**2

# Downcast integers
int_columns = df.select_dtypes(include=['int64']).columns

for col in int_columns:

    df[col] = pd.to_numeric(df[col], downcast="integer")

# Downcast floats
float_columns = df.select_dtypes(include=['float64']).columns

for col in float_columns:

    df[col] = pd.to_numeric(df[col], downcast="float")

after = df.memory_usage(deep=True).sum()/1024**2

print(f"Before : {before:.2f} MB")

print(f"After  : {after:.2f} MB")

saved = before-after

print(f"Memory Saved : {saved:.2f} MB")

# ==========================================================
# Save Initial Report
# ==========================================================

with open(REPORT_PATH,"w") as f:

    f.write("="*60+"\n")
    f.write("PREPROCESSING REPORT\n")
    f.write("="*60+"\n\n")

    f.write(f"Rows : {df.shape[0]}\n")

    f.write(f"Columns : {df.shape[1]}\n")

    f.write(f"Memory Before : {before:.2f} MB\n")

    f.write(f"Memory After : {after:.2f} MB\n")

print("\nInitial Report Generated")

section("PART 1 COMPLETED")

# ==========================================================
# PART 2 : DATA CLEANING
# ==========================================================

section("PART 2 : DATA CLEANING")

# ==========================================================
# Duplicate Rows
# ==========================================================

section("Checking Duplicate Rows")

before_rows = df.shape[0]

duplicates = df.duplicated().sum()

print(f"Duplicate Rows Found : {duplicates}")

if duplicates > 0:

    df.drop_duplicates(inplace=True)

after_rows = df.shape[0]

print(f"Rows Before : {before_rows}")

print(f"Rows After  : {after_rows}")

print(f"Removed     : {before_rows-after_rows}")

# ==========================================================
# Missing Values
# ==========================================================

section("Checking Missing Values")

missing = df.isnull().sum()

missing = missing[missing > 0]

if len(missing)==0:

    print("No Missing Values Found")

else:

    print(missing.sort_values(ascending=False))

# ==========================================================
# Infinite Values
# ==========================================================

section("Checking Infinite Values")

numeric_columns = df.select_dtypes(include=np.number).columns

inf_count = np.isinf(df[numeric_columns]).sum().sum()

print(f"Total Infinite Values : {inf_count}")

if inf_count>0:

    df[numeric_columns] = df[numeric_columns].replace([np.inf,-np.inf],np.nan)

    print("Infinite Values Replaced with NaN")

else:

    print("No Infinite Values Found")

# ==========================================================
# Handle Missing Values
# ==========================================================

section("Handling Missing Values")

before_missing = df.isnull().sum().sum()

print(f"Missing Values Before : {before_missing}")

# Remove rows containing NaN
df.dropna(inplace=True)

after_missing = df.isnull().sum().sum()

print(f"Missing Values After  : {after_missing}")

print(f"Current Shape : {df.shape}")

# ==========================================================
# Constant Columns
# ==========================================================

section("Checking Constant Columns")

constant_columns = []

for col in df.columns:

    if df[col].nunique()==1:

        constant_columns.append(col)

print(f"Constant Columns : {len(constant_columns)}")

if len(constant_columns)>0:

    print(constant_columns)

    df.drop(columns=constant_columns,inplace=True)

    print("Constant Columns Removed")

else:

    print("No Constant Columns Found")

print(f"Current Shape : {df.shape}")

# ==========================================================
# Label Distribution
# ==========================================================

section("Attack Distribution")

print(df["Label"].value_counts())

# ==========================================================
# Save Clean Dataset
# ==========================================================

section("Saving Clean Dataset")

df.to_csv(OUTPUT_PATH,index=False)

print("Clean Dataset Saved Successfully")

print(OUTPUT_PATH)

# ==========================================================
# Update Report
# ==========================================================

with open(REPORT_PATH,"a") as f:

    f.write("\n")

    f.write("="*60+"\n")

    f.write("PART 2 REPORT\n")

    f.write("="*60+"\n\n")

    f.write(f"Duplicate Rows : {duplicates}\n")

    f.write(f"Infinite Values : {inf_count}\n")

    f.write(f"Final Shape : {df.shape}\n")

    f.write(f"Constant Columns Removed : {len(constant_columns)}\n")

print("\nReport Updated Successfully")

section("PART 2 COMPLETED")

# ==========================================================
# PART 3 : FEATURE ENGINEERING
# ==========================================================

from sklearn.preprocessing import LabelEncoder
import joblib

section("PART 3 : FEATURE ENGINEERING")

# ==========================================================
# Drop Unnecessary Columns
# ==========================================================

section("Removing Unnecessary Columns")

drop_columns = []

# Source_File is useful only for reference
if "Source_File" in df.columns:
    drop_columns.append("Source_File")

if len(drop_columns) > 0:

    df.drop(columns=drop_columns, inplace=True)

print("Removed Columns :", drop_columns)

print("Current Shape :", df.shape)

# ==========================================================
# Encode Labels
# ==========================================================

section("Encoding Labels")

label_encoder = LabelEncoder()

df["Label"] = label_encoder.fit_transform(df["Label"])

print("Label Encoding Completed")

print("\nClass Mapping\n")

for index, label in enumerate(label_encoder.classes_):

    print(f"{index} ---> {label}")

# Save encoder

os.makedirs("models", exist_ok=True)

joblib.dump(label_encoder, "models/label_encoder.pkl")

print("\nLabel Encoder Saved")

# ==========================================================
# Split Features & Target
# ==========================================================

section("Splitting Features and Target")

X = df.drop("Label", axis=1)

y = df["Label"]

print("Feature Matrix Shape :", X.shape)

print("Target Shape :", y.shape)

# ==========================================================
# Save Feature Names
# ==========================================================

feature_file = "models/feature_names.txt"

with open(feature_file, "w") as f:

    for feature in X.columns:

        f.write(feature + "\n")

print("Feature Names Saved")

# ==========================================================
# Save Processed Dataset
# ==========================================================

processed_path = "data/ml_dataset.csv"

df.to_csv(processed_path, index=False)

print("Machine Learning Dataset Saved")

# ==========================================================
# Update Report
# ==========================================================

with open(REPORT_PATH, "a") as f:

    f.write("\n")
    f.write("=" * 60 + "\n")
    f.write("PART 3 REPORT\n")
    f.write("=" * 60 + "\n\n")
    f.write(f"Features : {X.shape[1]}\n")
    f.write(f"Samples : {X.shape[0]}\n")
    f.write(f"Classes : {len(label_encoder.classes_)}\n")

section("PART 3 COMPLETED")