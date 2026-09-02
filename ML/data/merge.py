import glob
import os
import pandas as pd

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


# Folder containing all CSV files
folder_path = resolve_path("MachineLearningCSV")
if not os.path.exists(folder_path):
    folder_path = resolve_path("../MachineLearningCVE")

# Get all CSV file paths
csv_files = glob.glob(os.path.join(folder_path, "*.csv"))
print(f"Found {len(csv_files)} CSV files in {folder_path}")

if not csv_files:
    print("[!] No CSV files found to merge. Please place raw CSV datasets in MachineLearningCSV/ directory.")
else:
    dfs = []
    for file in csv_files:
        print("Reading:", os.path.basename(file))
        df = pd.read_csv(file)
        df["Source_File"] = os.path.basename(file)
        dfs.append(df)

    merged_df = pd.concat(dfs, ignore_index=True)
    merged_df.columns = merged_df.columns.str.strip()
    print("Merged Shape:", merged_df.shape)

    out_path = os.path.join(BASE_DIR, "merged_dataset.csv")
    merged_df.to_csv(out_path, index=False)
    print("Dataset saved successfully to:", out_path)