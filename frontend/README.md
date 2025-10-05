# GRIT-X-AWA Frontend

Astro + React frontend for exoplanet classification and space exploration.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

**Access:** http://localhost:4325

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── pages/
│   │   │   └── Dashboard.tsx      # ML upload & predictions
│   │   ├── PredictionResults.tsx  # Results modal
│   │   ├── DashboardSection.tsx   # Section wrapper
│   │   ├── Hero.tsx               # Landing page hero
│   │   ├── ThemeToggle.tsx        # Dark/light mode
│   │   └── ...
│   ├── services/
│   │   ├── api.ts                 # Backend API client
│   │   ├── dataLoader.ts          # Data loading
│   │   └── indexedDBCache.ts      # Client-side cache
│   ├── layouts/
│   │   └── Layout.astro           # Page layout
│   ├── pages/
│   │   ├── index.astro            # Home page
│   │   └── dashboard.astro        # Dashboard page
│   ├── styles/
│   │   └── global.css             # Global styles
│   └── config/
│       └── supabase.ts            # Supabase config
├── public/
│   └── grit-logo.svg
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
└── package.json
```

---

## 🎨 Features

### 1. ML Dashboard

**Upload CSV → Get Predictions**

- Drag & drop or file picker
- Auto-detects dataset type (Kepler/TESS)
- Real-time validation
- Beautiful results visualization
- Export to CSV/JSON

**Supported Models:**
- **Kepler:** 21 features → CANDIDATE, CONFIRMED, FALSE POSITIVE
- **TESS:** 15 features → APC, CP, FA, FP, KP, PC

### 2. Prediction Results

- Class distribution charts
- Confidence score visualization
- Paginated results table
- Export functionality

### 3. Dark/Light Mode

Toggle between themes with persistent storage.

### 4. Responsive Design

Mobile-first design with Tailwind CSS.

---

## 🔧 Configuration

### API Base URL

Update in `src/services/api.ts`:

```typescript
// Local development
const API_BASE_URL = 'http://localhost:8000';

// Production
const API_BASE_URL = 'https://grit-x-awa-1035421252747.europe-west1.run.app';
```

### Supabase (Optional)

Configure in `src/config/supabase.ts`:

```typescript
export const supabaseUrl = 'https://your-project.supabase.co';
export const supabaseAnonKey = 'your_anon_key';
```

---

## 📦 Dependencies

### Core
- **Astro** 4.x - Static site generator
- **React** 18.x - UI library
- **TypeScript** 5.x - Type safety

### Styling
- **Tailwind CSS** 3.x - Utility-first CSS
- **@astrojs/tailwind** - Tailwind integration

### UI Components
- Custom React components
- Responsive design
- Dark mode support

---

## 🎯 Pages

### Home (`/`)

Landing page with hero section and project overview.

### Dashboard (`/dashboard`)

ML upload and prediction interface:

1. **Model Selection** - Choose Kepler or TESS
2. **File Upload** - Drag & drop CSV
3. **Validation** - Auto-validates columns
4. **Analysis** - Run ML predictions
5. **Results** - View predictions with confidence scores

---

## 🔄 Development Workflow

### Run Dev Server

```bash
npm run dev
```

Auto-reloads on file changes.

### Build for Production

```bash
npm run build
```

Output: `dist/` directory

### Preview Production Build

```bash
npm run preview
```

---

## 🧪 Testing ML Upload

### 1. Start Backend

```bash
cd ../backend
venv\Scripts\activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 2. Start Frontend

```bash
npm run dev
```

### 3. Test Upload

1. Go to http://localhost:4325/dashboard
2. Select **Kepler** or **TESS** model
3. Upload `../test_kepler_sample.csv` or `../test_tess_sample.csv`
4. Click **"Run ML Analysis"**
5. View prediction results!

---

## 📊 API Integration

### Upload & Predict

```typescript
import { apiService } from './services/api';

const results = await apiService.uploadAndPredict(file);
// results.predictions contains all predictions
```

### Response Type

```typescript
interface UploadResponse {
  success: boolean;
  message: string;
  job_id: string;
  dataset_type: 'kepler' | 'tess';
  file_url: string;
  total_predictions: number;
  predictions: PredictionResult[];
}

interface PredictionResult {
  row_index: number;
  predicted_class: string;
  confidence: Record<string, number>;
}
```

---

## 🎨 Styling

### Tailwind CSS

Utility classes for rapid development:

```tsx
<div className="bg-gray-900 rounded-lg p-6 shadow-xl">
  <h2 className="text-2xl font-bold text-white mb-4">
    Prediction Results
  </h2>
</div>
```

### Dark Mode

Toggle via `ThemeToggle` component:

```tsx
<ThemeToggle />
```

Stored in `localStorage` for persistence.

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

### Manual Build

```bash
npm run build
# Upload dist/ to any static host
```

---

## 🐛 Troubleshooting

### API Connection Error

**Error:** `Failed to fetch`

**Solutions:**
1. Check backend is running: `curl http://localhost:8000/docs`
2. Verify API_BASE_URL in `src/services/api.ts`
3. Check CORS settings in backend

### Upload Validation Error

**Error:** `Missing required columns`

**Solution:** Backend auto-detects dataset type. The file just needs to match either Kepler OR TESS format, not the selected model.

### Build Errors

**Error:** Module not found

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 Component Examples

### Basic Upload Flow

```tsx
const [file, setFile] = useState<File | null>(null);
const [results, setResults] = useState<UploadResponse | null>(null);

const handleUpload = async () => {
  if (!file) return;
  
  const predictions = await apiService.uploadAndPredict(file);
  setResults(predictions);
};
```

### Prediction Results Display

```tsx
{results && (
  <PredictionResults
    results={results}
    onClose={() => setResults(null)}
  />
)}
```

---

## 🔗 Links

- **Backend:** `../backend/`
- **Live Demo:** https://grit-x-awa.vercel.app (if deployed)
- **Backend API:** https://grit-x-awa-1035421252747.europe-west1.run.app

---

## 📝 Scripts

```json
{
  "dev": "astro dev --port 4325",
  "build": "astro check && astro build",
  "preview": "astro preview",
  "astro": "astro"
}
```

---

## 📄 License

MIT License - See LICENSE file
