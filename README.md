# Clinic Density Atlas (Singapore Edition)

An interactive geospatial health intelligence platform visualizing clinic density (clinics per population), primary care accessibility ratios, and underserved zones across Singapore, powered by **OneMap.gov.sg** (Singapore Land Authority) and SingStat census data.

## Features

- **OneMap Singapore Basemaps**: Native integration of Singapore Land Authority's authoritative OneMap tiles (*OneMap Night*, *OneMap Default*, *OneMap Grey*, *OneMap Original*).
- **Singapore URA Planning Areas**: High-fidelity choropleth mapping across Singapore's major planning areas (Tampines, Bedok, Jurong West, Woodlands, Sengkang, Punggol, Yishun, Hougang, Ang Mo Kio, Choa Chu Kang, Bukit Batok, Bukit Merah, Toa Payoh, Novena, Pasir Ris, Clementi, Queenstown, Kallang, Downtown Core).
- **CHAS & Public Healthcare Facilities**:
  - Public Polyclinics (SingHealth, NHG, NUHS)
  - CHAS GP Family Clinics with subsidy tiers (Blue, Orange, Green, Pioneer, Merdeka)
  - Urgent Care Centres (UCC @ Admiralty, St Luke's)
  - Community Health & Silver Generation Posts
  - Healthier SG Enrolled status
  - 6-digit Singapore postal codes and nearest MRT stations
- **OneMap Address & Postal Code Geocoder**: Instant address lookup via `onemap.gov.sg/api/common/elastic/search` for placement simulation.
- **Clinic Placement Simulator ("What-If" Planning)**: Drop proposed clinics in Singapore estates to model density shifts and Healthier SG capacity in real time.
- **Singapore Health Clusters**: Toggle between URA Planning Areas and the 3 Regional Health Systems (*SingHealth*, *NHG*, *NUHS*).
- **Rankings Leaderboard & CSV Export**: Sortable data table with SingStat population counts and one-click CSV export.

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
