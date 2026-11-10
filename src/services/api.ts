import { District, Clinic, ProposedClinicInput } from '../types/clinic';
import { SINGAPORE_PLANNING_AREAS, SINGAPORE_CLINICS, SINGAPORE_CLUSTERS } from '../data/mockData';

// Base API URL that user can configure once backend is integrated
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export interface ApiEndpointsSpec {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  description: string;
  requestBodySchema?: string;
  responseSample: string;
}

export const BACKEND_API_SPECS: ApiEndpointsSpec[] = [
  {
    method: 'GET',
    endpoint: 'https://www.onemap.gov.sg/maps/tiles/{Style}/{z}/{x}/{y}.png',
    description: 'Authoritative national map tile service by Singapore Land Authority (SLA). Styles: Default, Night, Grey, Original.',
    responseSample: `/* PNG Tile Stream [256x256 / 512x512] */`,
  },
  {
    method: 'GET',
    endpoint: '/api/v1/singapore/planning-areas',
    description: 'Returns Singapore URA Master Plan Planning Areas with census resident populations and clinic density indexes.',
    responseSample: `[
  {
    "id": "sg-tampines",
    "code": "TM-01",
    "name": "Tampines Planning Area",
    "population": 274200,
    "areaSqKm": 20.89,
    "demographics": { "medianAge": 41.2, "uninsuredRate": 14.8, "seniorsPercent": 17.5, "hdbResidentPercent": 84.2 },
    "coordinates": [[[103.925, 1.340], ...]],
    "clinicsCount": 78,
    "targetDensity": 2.8
  }
]`,
  },
  {
    method: 'GET',
    endpoint: '/api/v1/singapore/clinics?type=polyclinic|chas_gp',
    description: 'Retrieves verified public polyclinics and CHAS GP medical practices sourced from OneMap / MOH.',
    responseSample: `[
  {
    "id": "sg-c-101",
    "name": "Tampines Polyclinic (SingHealth)",
    "type": "polyclinic",
    "districtId": "sg-tampines",
    "address": "1 Tampines St 41",
    "postalCode": "529203",
    "mrtStation": "Tampines (EW2 / DT32)",
    "latitude": 1.3551,
    "longitude": 103.9482,
    "phone": "+65 6643 6969",
    "healthierSgEnrolled": true,
    "healthcareCluster": "SingHealth"
  }
]`,
  },
  {
    method: 'GET',
    endpoint: 'https://www.onemap.gov.sg/api/common/elastic/search?searchVal=Tampines&returnGeom=Y&getAddrDetails=Y',
    description: 'OneMap Singapore Address & Postal Code Geocoding API for locating Singapore facilities and addresses.',
    responseSample: `{
  "found": 1,
  "totalNumPages": 1,
  "pageNum": 1,
  "results": [
    {
      "SEARCHVAL": "TAMPINES POLYCLINIC",
      "BLK_NO": "1",
      "ROAD_NAME": "TAMPINES STREET 41",
      "BUILDING": "TAMPINES POLYCLINIC",
      "ADDRESS": "1 TAMPINES STREET 41 TAMPINES POLYCLINIC SINGAPORE 529203",
      "POSTAL": "529203",
      "X": "40892.12",
      "Y": "37912.44",
      "LATITUDE": "1.3551",
      "LONGITUDE": "103.9482"
    }
  ]
}`,
  },
  {
    method: 'POST',
    endpoint: '/api/v1/singapore/clinics/simulate',
    description: 'Evaluates placement of a proposed clinic in Singapore and models local density shift & Healthier SG capacity.',
    requestBodySchema: `{
  "name": "Proposed Family Medicine Clinic @ Punggol Northshore",
  "type": "primary_care",
  "postalCode": "828832",
  "latitude": 1.4150,
  "longitude": 103.9050,
  "districtId": "sg-punggol",
  "staffPhysicians": 4,
  "healthierSgEnrolled": true
}`,
    responseSample: `{
  "success": true,
  "districtId": "sg-punggol",
  "priorDensityPer10k": 1.87,
  "newDensityPer10k": 1.92,
  "cluster": "SingHealth",
  "residentsWithin15MinWalk": 14200
}`,
  },
];

/**
 * Searches Singapore addresses via OneMap GeoSearch
 */
export async function searchOneMapAddress(query: string) {
  if (!query || query.trim().length < 2) return [];
  try {
    const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(
      query
    )}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      return data.results || [];
    }
  } catch {
    // Return empty on network / CORS failure
  }
  return [];
}

/**
 * Service to fetch districts and clinics.
 * Aligned with OneMap and Singapore Planning Areas.
 */
export async function getDistricts(dataset: 'planning_areas' | 'clusters' = 'planning_areas'): Promise<District[]> {
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/singapore/planning-areas`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
  }
  return dataset === 'planning_areas' ? SINGAPORE_PLANNING_AREAS : SINGAPORE_CLUSTERS;
}

export async function getClinics(): Promise<Clinic[]> {
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/singapore/clinics`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
  }
  return SINGAPORE_CLINICS;
}

export function exportDistrictsToCSV(
  districts: District[],
  clinics: Clinic[],
  desertThreshold: number
): void {
  const headers = [
    'Planning Area Code',
    'Planning Area Name',
    'Resident Population',
    'Land Area (sq km)',
    'Verified Clinics Count',
    'Clinics Per 10k Pop',
    'Clinics Per 100k Pop',
    'Residents Per Clinic',
    'CHAS Blue Subsidy Rate (%)',
    'Low Income / ComCare Rate (%)',
    'Seniors 65+ (%)',
    'HDB Residents (%)',
    'Coverage Status',
    'Deficit To Target Benchmark',
  ];

  const rows = districts.map(d => {
    const districtClinics = clinics.filter(c => c.districtId === d.id);
    const count = districtClinics.length || d.clinicsCount;
    const density10k = (count / d.population) * 10000;
    const density100k = (count / d.population) * 100000;
    const popPerClinic = count > 0 ? Math.round(d.population / count) : d.population;
    const isDesert = density10k < desertThreshold;
    const targetClinics = Math.ceil((desertThreshold * d.population) / 10000);
    const deficit = Math.max(0, targetClinics - count);

    return [
      `"${d.code}"`,
      `"${d.name}"`,
      d.population,
      d.areaSqKm,
      count,
      density10k.toFixed(2),
      density100k.toFixed(1),
      popPerClinic,
      d.demographics.uninsuredRate,
      d.demographics.lowIncomeRate,
      d.demographics.seniorsPercent,
      d.demographics.hdbResidentPercent ?? 80,
      `"${isDesert ? 'Healthcare Shortage Desert' : 'Adequate Supply'}"`,
      deficit,
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `singapore_clinic_density_onemap_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
