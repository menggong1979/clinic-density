/**
 * Type definitions for Clinic Density Atlas
 */

export type ClinicType = 
  | 'primary_care' 
  | 'urgent_care' 
  | 'community_health' 
  | 'pediatric' 
  | 'womens_health' 
  | 'dental_specialty';

export interface Clinic {
  id: string;
  name: string;
  type: ClinicType;
  districtId: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  hours: string;
  acceptsMedicaid: boolean;
  isEmergency: boolean;
  capacityBeds?: number;
  staffPhysicians: number;
  isSimulated?: boolean;
}

export interface DistrictDemographics {
  medianAge: number;
  uninsuredRate: number; // percentage, e.g. 14.5
  lowIncomeRate: number; // percentage below poverty line, e.g. 21.0
  seniorsPercent: number; // percentage > 65yo
}

export interface District {
  id: string;
  name: string;
  code: string;
  population: number;
  areaSqKm: number;
  demographics: DistrictDemographics;
  // GeoJSON geometry: polygon coordinates [[[lng, lat], [lng, lat], ...]]
  coordinates: [number, number][][]; 
  center: [number, number]; // [lat, lng]
  clinicsCount: number;
  clinicTypesBreakdown: Record<ClinicType, number>;
  targetDensity?: number; // Target clinics per 10k
}

export type DensityMetricType = 
  | 'per_10k'      // Clinics per 10,000 residents (primary planning metric)
  | 'per_100k'     // Clinics per 100,000 residents
  | 'pop_per_clinic' // People per single clinic
  | 'total_clinics'  // Raw clinic count
  | 'total_pop';     // Raw population

export interface FilterState {
  searchQuery: string;
  selectedTypes: ClinicType[];
  metric: DensityMetricType;
  desertThreshold: number; // e.g. 2.0 clinics per 10k
  showClinicPins: boolean;
  showCatchmentBuffers: boolean;
  showHeatmap: boolean;
  showDesertHighlight: boolean;
  selectedBasemap: 'dark' | 'light' | 'streets' | 'satellite';
  selectedRegionDataset: 'metro' | 'tricounty';
}

export interface CalculatedDistrictStats {
  district: District;
  clinics: Clinic[];
  totalClinics: number;
  densityPer10k: number;
  densityPer100k: number;
  popPerClinic: number;
  isDesert: boolean;
  deficitToTarget: number; // how many clinics needed to reach target threshold
  healthEquityScore: number; // 0 - 100 index based on vulnerability + density
}

export interface ProposedClinicInput {
  name: string;
  type: ClinicType;
  latitude: number;
  longitude: number;
  districtId: string;
  staffPhysicians: number;
  acceptsMedicaid: boolean;
}
