import pandas as pd
import glob
import os

# Folder containing all CSV files
folder_path = "data/MachineLearningCSV"

# Get all CSV file paths
csv_files = glob.glob(os.path.join(folder_path, "*.csv"))

print(f"Found {len(csv_files)} CSV files")

# Empty list
dfs = []

# Read every CSV
for file in csv_files:
    print("Reading:", os.path.basename(file))

    df = pd.read_csv(file)

    # Optional: Keep track of which file each row came from
    df["Source_File"] = os.path.basename(file)

    dfs.append(df)

# Merge everything
merged_df = pd.concat(dfs, ignore_index=True)

# Remove leading/trailing spaces from all column names
merged_df.columns = merged_df.columns.str.strip()

print("Merged Shape:", merged_df.shape)

# Save merged dataset
merged_df.to_csv("data/merged_dataset.csv", index=False)

print("Dataset saved successfully!")

print(merged_df.shape)

print(merged_df.info())

print(merged_df.columns.tolist())