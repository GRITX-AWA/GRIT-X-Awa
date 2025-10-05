# Required Columns for ML Models

This document lists the exact columns required for each ML model, based on the example data files for ML training.

---

## 📁 Source Files

- **Kepler Model**: `kepler_exampleData(Sheet1).csv`
- **TESS Model**: `tess_exampleData(Sheet1).csv`

---

## 🔭 Kepler Model - Required Columns (22 total)

Your CSV/TXT/XLSX file must contain **ALL** of these columns in the header row:

```
kepid
koi_pdisposition
koi_score
koi_fpflag_nt
koi_fpflag_ss
koi_fpflag_co
koi_fpflag_ec
koi_period
koi_impact
koi_duration
koi_depth
koi_prad
koi_teq
koi_insol
koi_model_snr
koi_tce_plnt_num
koi_steff
koi_slogg
koi_srad
ra
dec
koi_kepmag
```

### Key Columns Explained:
- `kepid` - Kepler Input Catalog ID (unique identifier)
- `koi_pdisposition` - Pipeline disposition (CANDIDATE, FALSE POSITIVE)
- `koi_score` - Disposition score (0-1, higher = more likely planet)
- `koi_fpflag_nt` - Not transit-like false positive flag
- `koi_fpflag_ss` - Stellar eclipse false positive flag
- `koi_fpflag_co` - Centroid offset false positive flag
- `koi_fpflag_ec` - Ephemeris match false positive flag
- `koi_period` - Orbital period in days
- `koi_impact` - Impact parameter
- `koi_duration` - Transit duration in hours
- `koi_depth` - Transit depth in ppm
- `koi_prad` - Planet radius in Earth radii
- `koi_teq` - Equilibrium temperature in Kelvin
- `koi_insol` - Insolation flux (Earth flux)
- `koi_model_snr` - Transit signal-to-noise ratio
- `koi_tce_plnt_num` - TCE planet number
- `koi_steff` - Stellar effective temperature in Kelvin
- `koi_slogg` - Stellar surface gravity (log g)
- `koi_srad` - Stellar radius in solar radii
- `ra` - Right ascension in degrees
- `dec` - Declination in degrees
- `koi_kepmag` - Kepler magnitude

---

## 🛰️ TESS Model - Required Columns (18 total)

Your CSV/TXT/XLSX file must contain **ALL** of these columns in the header row:

```
toi
ra
dec
st_teff
st_logg
st_rad
st_dist
st_pmra
st_pmdec
st_tmag
pl_orbper
pl_rade
pl_trandep
pl_trandurh
pl_eqt
pl_insol
pl_tranmid
pl_pnum
```

### Key Columns Explained:
- `toi` - TESS Object of Interest number (unique identifier)
- `ra` - Right ascension in degrees
- `dec` - Declination in degrees
- `st_teff` - Stellar effective temperature in Kelvin
- `st_logg` - Stellar surface gravity (log g)
- `st_rad` - Stellar radius in solar radii
- `st_dist` - Distance to star in parsecs
- `st_pmra` - Proper motion in RA (mas/year)
- `st_pmdec` - Proper motion in Dec (mas/year)
- `st_tmag` - TESS magnitude
- `pl_orbper` - Planet orbital period in days
- `pl_rade` - Planet radius in Earth radii
- `pl_trandep` - Transit depth in ppm
- `pl_trandurh` - Transit duration in hours
- `pl_eqt` - Planet equilibrium temperature in Kelvin
- `pl_insol` - Insolation flux (Earth flux)
- `pl_tranmid` - Transit midpoint time
- `pl_pnum` - Planet number in multi-planet system

---

## ⚠️ Important Notes

### Supported File Types:
All three file types are validated with the same column requirements:
- ✅ **CSV** (Comma-Separated Values) - Full validation
- ✅ **TXT** (Tab or Comma delimited) - Full validation
- ✅ **XLSX** (Excel) - Basic validation (detailed validation server-side)

### Column Name Matching:
- Column names are **case-sensitive**
- Names must match **exactly** as shown above
- No extra spaces or special characters
- Header must be in the first row (after any comment lines)

### File Format:
- Maximum file size: **5 MB**
- First non-comment row must be the header with column names
- Comment lines starting with `#` are allowed before the header
- CSV/TXT: Supports both comma (`,`) and tab (`\t`) delimiters
- XLSX: Must have columns in first row

### Validation Process:
1. **CSV/TXT Files:**
   - Immediate validation of column names
   - Missing columns reported instantly
   - Duplicate columns detected
   - Row structure validated (first 10 rows)

2. **XLSX Files:**
   - Basic format check on upload
   - Full column validation when running ML model
   - Warning message shows required columns

---

## 📋 Example File Structures

### Kepler CSV Example:
```csv
kepid,koi_pdisposition,koi_score,koi_fpflag_nt,koi_fpflag_ss,...
10797460,CANDIDATE,0.95,0,0,...
10811496,FALSE POSITIVE,0.12,1,0,...
```

### TESS CSV Example:
```csv
toi,ra,dec,st_teff,st_logg,st_rad,...
100.01,1.02238,-66.9876,5780,4.43,1.02,...
100.02,1.02238,-66.9876,5780,4.43,1.02,...
```

### TXT File (Tab-delimited):
```
toi	ra	dec	st_teff	st_logg	st_rad...
100.01	1.02238	-66.9876	5780	4.43	1.02...
```

---

## 🔍 How to Get the Correct Format

### Option 1: Use Provided Examples
Use the example files included in the project root:
- `kepler_exampleData(Sheet1).csv` (Kepler format)
- `tess_exampleData(Sheet1).csv` (TESS format)

### Option 2: Download from NASA
1. Visit [NASA Exoplanet Archive](https://exoplanetarchive.ipac.caltech.edu)
2. For Kepler: Download "Cumulative KOI" table
3. For TESS: Download "TESS TOI" table
4. Select only the required columns listed above
5. Download as CSV format

### Option 3: Create Your Own
If creating your own file:
1. Create header row with exact column names
2. Ensure column order doesn't matter (but all must be present)
3. Provide valid numeric/text data
4. Include at least one data row
5. Save as CSV, TXT, or XLSX

---

## ✅ Validation Checklist

Before uploading your file:

### File Requirements:
- [ ] File is CSV, TXT, or XLSX format
- [ ] File size is under 5 MB
- [ ] Header row contains all required columns
- [ ] Column names match exactly (case-sensitive)
- [ ] No duplicate column names
- [ ] At least one data row exists

### CSV/TXT Specific:
- [ ] Delimiter is comma or tab (consistent throughout)
- [ ] Quoted values use double quotes if needed
- [ ] Each row has same number of columns

### XLSX Specific:
- [ ] Columns are in first row
- [ ] No merged cells in header row
- [ ] Data starts in row 2

---

## 🚨 Common Errors & Solutions

### "Missing required columns: [column names]"
**Cause:** Your file doesn't have all required columns
**Fix:** Add the missing columns or use the example files

**Example:**
```
Missing required columns: koi_prad, koi_teq, koi_insol
```
→ Add these three columns to your CSV header

### "Duplicate columns found: [column names]"
**Cause:** Same column name appears twice in header
**Fix:** Remove duplicate columns from your file

**Example:**
```
Duplicate columns found: ra, dec
```
→ Check header row and remove the second occurrence

### "Row X: Expected Y columns, found Z"
**Cause:** Data row has different number of values than header
**Fix:** Ensure all rows have the same number of comma/tab-separated values

**Example:**
```
Row 3: Expected 22 columns, found 21
```
→ Check row 3 for missing comma or extra comma

### "File is empty or contains only comments"
**Cause:** CSV has no data rows or only `#` comment lines
**Fix:** Add at least one data row after the header

---

## 📊 Column Count Summary

| Model | Required Columns | Example File |
|-------|-----------------|--------------|
| **Kepler** | 22 columns | `kepler_exampleData(Sheet1).csv` |
| **TESS** | 18 columns | `tess_exampleData(Sheet1).csv` |

---

## 💡 Tips for Success

1. **Start with example files** - Easiest way to ensure correct format
2. **Check column names** - Copy-paste from this document to avoid typos
3. **Validate before running** - Upload shows validation errors immediately
4. **Use CSV for testing** - Faster validation than XLSX
5. **Keep backups** - Save original files before modifications

---

## 📞 Need Help?

If you're having trouble with file validation:

1. ✅ Download and test with the example files first
2. ✅ Compare your file header with the required columns list
3. ✅ Check the validation error messages - they're specific
4. ✅ Use a CSV editor to inspect your file structure
5. ✅ Ensure no hidden characters or extra spaces in column names

---

**Last Updated**: Based on example files from project
**Validation**: Applies to CSV, TXT, and XLSX file formats
**Source**: `kepler_exampleData(Sheet1).csv` and `tess_exampleData(Sheet1).csv`
