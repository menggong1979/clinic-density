# Clinic Density Atlas

An interactive geospatial health intelligence platform visualizing clinic density (clinics per population), healthcare accessibility ratios, and underserved zones with a real-time planning simulator.

## Features

- **Interactive Choropleth Mapping**: Visualizes clinic density across administrative districts with standardized public health thresholds (< 1.2 critical shortage to ≥ 4.5 high density hub).
- **Multi-Metric Density Analysis**:
  - Clinics per 10,000 residents (urban/regional planning benchmark)
  - Clinics per 100,000 residents
  - Population per single clinic
  - Total facility and population counts
- **Interactive Layers**:
  - **Clinic Points**: Categorized by facility type (Primary Care, Urgent Care, Community Health / FQHC, Pediatric, Women's Health, Dental & Specialty).
  - **15-Minute Catchment Buffers**: 1.2km transit/walk buffers illustrating coverage vs deadzones.
  - **Healthcare Desert Highlights**: Real-time identification of districts below configurable thresholds.
- **Clinic Placement Simulator ("What-If" Planning)**:
  - Drop proposed clinics onto the map or assign to deficit districts.
  - Instant re-calculation of density ratios, access gains, and desert resolution status.
- **District Detail Inspector**:
  - Detailed demographics (uninsured %, poverty rate, seniors 65+).
  - Facility directory with doctor counts and Medicaid acceptance.
- **Rankings Leaderboard & CSV Export**:
  - Comprehensive table with sortable columns and one-click CSV export.
- **Equity Analytics**:
  - Disparity ratio calculation (highest vs lowest density district).
  - Priority capital allocation recommendations.
- **Backend API Integration Guide & Schema**:
  - Pre-wired client service layer (`src/services/api.ts`).
  - OpenAPI/REST endpoint documentation for easy backend integration.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit `http://localhost:3000` to access the application.

### Building for Production

```bash
npm run build
npm run preview
```

## Backend Integration

The frontend includes a plug-and-play service layer ready to connect to any backend (Express, FastAPI, Django, Go, etc.).

Set your API endpoint in `.env`:

```env
VITE_API_BASE_URL="http://localhost:8000"
```

### Expected Endpoints

1. `GET /api/v1/districts?region=metro` - Returns district boundaries and demographics
2. `GET /api/v1/clinics` - Returns verified clinic facilities
3. `POST /api/v1/clinics/simulate` - Evaluates simulated clinic additions

If no backend is connected, the app runs seamlessly using the built-in mock datasets.

## License

Apache-2.0
