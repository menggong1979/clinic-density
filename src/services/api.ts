import { District, Clinic, ProposedClinicInput } from '../types/clinic';
import { METRO_DISTRICTS, INITIAL_CLINICS, TRICOUNTY_DISTRICTS } from '../data/mockData';

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
    endpoint: '/api/v1/districts?region=metro',
    description: 'Returns district boundaries, census population counts, demographic indexes, and clinic statistics.',
    responseSample: `[
  {
    "id": "d-dt",
    "code": "D-01",
    "name": "Downtown Financial & Civic",
    "population": 84500,
    "areaSqKm": 6.8,
    "demographics": { "uninsuredRate": 8.2, "lowIncomeRate": 14.1, "seniorsPercent": 12.4 },
    "coordinates": [[ [-122.418, 37.782], ... ]],
    "clinicsCount": 32,
    "targetDensity": 3.0
  }
]`,
  },
  {
    method: 'GET',
    endpoint: '/api/v1/clinics?districtId=optional&type=optional',
    description: 'Returns list of verified medical facilities with coordinates, specialties, and operating attributes.',
    responseSample: `[
  {
    "id": "c-101",
    "name": "Civic Center Family Practice",
    "type": "primary_care",
    "districtId": "d-dt",
    "latitude": 37.7812,
    "longitude": -122.4178,
    "phone": "(415) 554-3200",
    "acceptsMedicaid": true,
    "staffPhysicians": 6
  }
]`,
  },
  {
    method: 'POST',
    endpoint: '/api/v1/clinics/simulate',
    description: 'Proposes a simulated clinic placement and receives recalculated density metrics and equity impact.',
    requestBodySchema: `{
  "name": "Proposed Community Health Pavilion",
  "type": "community_health",
  "latitude": 37.712,
  "longitude": -122.415,
  "districtId": "d-eastflat",
  "staffPhysicians": 5,
  "acceptsMedicaid": true
}`,
    responseSample: `{
  "success": true,
  "districtId": "d-eastflat",
  "priorDensityPer10k": 0.86,
  "newDensityPer10k": 0.93,
  "populationServedDelta": 12400,
  "healthcareDesertResolved": false
}`,
  },
];

/**
 * Service to fetch districts and clinics.
 * Falls back transparently to built-in datasets if backend is not yet attached.
 */
export async function getDistricts(region: 'metro' | 'tricounty' = 'metro'): Promise<District[]> {
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/districts?region=${region}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback to mock
    }
  }
  return region === 'metro' ? METRO_DISTRICTS : TRICOUNTY_DISTRICTS;
}

export async function getClinics(): Promise<Clinic[]> {
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/clinics`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback to mock
    }
  }
  return INITIAL_CLINICS;
}

export function exportDistrictsToCSV(
  districts: District[],
  clinics: Clinic[],
  desertThreshold: number
): void {
  const headers = [
    'District Code',
    'District Name',
    'Population',
    'Area (sq km)',
    'Clinics Count',
    'Clinics Per 10k Pop',
    'Clinics Per 100k Pop',
    'Population Per Clinic',
    'Uninsured Rate (%)',
    'Low Income Rate (%)',
    'Seniors (%)',
    'Desert Status',
    'Deficit To Target',
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
      `"${isDesert ? 'Healthcare Desert' : 'Adequate'}"`,
      deficit,
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `clinic_density_export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
