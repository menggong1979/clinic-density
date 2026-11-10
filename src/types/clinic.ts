/**
 * Type definitions for Clinic Density Atlas
 */

export type ClinicType = 
  | 'primary_care'      // CHAS GP / Family Medicine
  | 'polyclinic'        // Public Polyclinic (SingHealth / NHG / NUHS)
  | 'urgent_care'       // Urgent Care Centre (e.g. UCC @ Admiralty)
  | 'community_health'  // Community Health Post / Silver Generation
  | 'pediatric'         // Pediatric & KKH Satellite
  | 'womens_health'     // Women's & Maternal Health
  | 'dental_specialty'; // Dental & Specialty

export interface Clinic {
  id: string;
  name: string;
  type: ClinicType;
  districtId: string;
  address: string;
  postalCode?: string; // 6-digit Singapore postal code (e.g. 529203)
  mrtStation?: string; // Nearest MRT station (e.g. Tampines EW2/DT32)
  latitude: number;
  longitude: number;
  phone: string;
  hours: string;
  acceptsMedicaid: boolean; // Accepts CHAS (Community Health Assist Scheme) subsidies
  chasTier?: string;        // CHAS Blue / Orange / Green / Pioneer / Merdeka
  healthierSgEnrolled?: boolean; // Healthier SG accredited primary clinic
  isEmergency: boolean;
  capacityBeds?: number;
  staffPhysicians: number;
  healthcareCluster?: 'SingHealth' | 'NHG' | 'NUHS';
  isSimulated?: boolean;
}

export interface DistrictDemographics {
  medianAge: number;
  uninsuredRate: number; // Low-income subsidy / CHAS Blue rate (%)
  lowIncomeRate: number; // ComCare / low income assistance rate (%)
  seniorsPercent: number; // Seniors 65+ percentage
  hdbResidentPercent?: number; // Residents living in HDB flats (%)
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
  selectedBasemap: 'onemap_night' | 'onemap_default' | 'onemap_grey' | 'onemap_original' | 'satellite';
  selectedRegionDataset: 'planning_areas' | 'clusters';
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
