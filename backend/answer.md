# Adding Your Datasets to the SQLite Database

## Supported Formats
You can add your datasets in the following formats:
- CSV (Comma-Separated Values)
- VOTable (XML format used in astronomy)
- IPAC Table format
- TAB-separated text files

## How to Add Datasets

### 1. Prepare Your Dataset File
Ensure your dataset file contains the following fields (or compatible columns):
- `x_value` (float): The X coordinate or value.
- `y_value` (float): The Y coordinate or value.
- `description` (optional string): A description or metadata for the data point.

### 2. Use the Backend API to Add Data
You can add dataset entries by sending POST requests to the backend API endpoint:

```
POST http://localhost:8000/data/data
Content-Type: application/json

{
  "x_value": 1.23,
  "y_value": 4.56,
  "description": "Sample data point"
}
```

### 3. Automate Bulk Upload (Optional)
For bulk uploads, you can write a script to parse your dataset file (CSV, VOTable, IPAC, or TAB-separated) and send multiple POST requests to the API.

### 4. Viewing Data
Once added, the data will be stored in the SQLite database (`exoplanets.db` by default) and can be viewed on the frontend Datasets page.

---

If you need help with a script to convert your dataset files and upload them, please let me know.
