# Patient Vitals Monitoring Dashboard

Teaching demo for exploring patient vital-sign trends. Dark UI. **Synthetic data only.**

Sticky banner: `Teaching demo — synthetic data only.`

## Stack

Vite · React · TypeScript · Tailwind CSS · Recharts · Papa Parse · Vitest · React Testing Library

## Quick start

```bash
npm install
npm run dev
```

## Scripts

- `npm ci` / `npm install` — install dependencies
- `npm test` — run Vitest
- `npm run build` — production build (`tsc -b && vite build`)
- `npm run preview` — preview production build

## Synthetic data

- 20 patients
- Reading every 4 hours for 3 days → **18 readings per patient**
- Vitals: heart rate, systolic/diastolic BP, SpO₂, temperature °F
- Mostly normal values plus a few out-of-range outliers so alerts demo

## Vital ranges (adult teaching defaults, inclusive)

| Vital | Range |
| --- | --- |
| Heart rate | 60–100 bpm |
| Systolic BP | 90–120 mmHg |
| Diastolic BP | 60–80 mmHg |
| SpO₂ | 95–100 % |
| Temperature | 97.0–99.0 °F |

## CSV format

Upload a CSV to **replace** the current dataset. Header must be:

```csv
patient_id,patient_name,timestamp,heart_rate,systolic_bp,diastolic_bp,spo2,temperature_f
```

- ISO-8601 timestamps
- Bad rows are skipped (count shown)
- A totally invalid file shows a clear error
- **Reset to synthetic** restores the built-in seed
- Sample file: `public/sample-vitals.csv`

## Alerts today

“Today” is the **latest calendar day present in the dataset** (not the wall clock). The summary card lists how many patients have any out-of-range reading on that day.

## CI

GitHub Actions runs `npm ci`, `npm test`, and `npm run build` on pull requests and pushes to `main`.
