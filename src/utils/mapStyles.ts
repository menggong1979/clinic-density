import { DensityMetricType, District, Clinic } from '../types/clinic';

export interface LegendStep {
  label: string;
  color: string;
  min: number;
  max: number;
}

export function getMetricValue(
  district: District,
  clinics: Clinic[],
  metric: DensityMetricType
): number {
  const districtClinics = clinics.filter(c => c.districtId === district.id);
  const count = districtClinics.length || district.clinicsCount;

  switch (metric) {
    case 'per_10k':
      return district.population > 0 ? (count / district.population) * 10000 : 0;
    case 'per_100k':
      return district.population > 0 ? (count / district.population) * 100000 : 0;
    case 'pop_per_clinic':
      return count > 0 ? Math.round(district.population / count) : district.population;
    case 'total_clinics':
      return count;
    case 'total_pop':
      return district.population;
    default:
      return 0;
  }
}

export function getLegendSteps(metric: DensityMetricType): LegendStep[] {
  switch (metric) {
    case 'per_10k':
      return [
        { label: '< 1.2 (Critical Shortage)', color: '#dc2626', min: 0, max: 1.2 },
        { label: '1.2 – 2.0 (High Need)', color: '#ea580c', min: 1.2, max: 2.0 },
        { label: '2.0 – 3.0 (Moderate Access)', color: '#d97706', min: 2.0, max: 3.0 },
        { label: '3.0 – 4.5 (Adequate Supply)', color: '#0284c7', min: 3.0, max: 4.5 },
        { label: '≥ 4.5 (High Density Hub)', color: '#059669', min: 4.5, max: 999 },
      ];
    case 'per_100k':
      return [
        { label: '< 12 (Critical Shortage)', color: '#dc2626', min: 0, max: 12 },
        { label: '12 – 20 (High Need)', color: '#ea580c', min: 12, max: 20 },
        { label: '20 – 30 (Moderate Access)', color: '#d97706', min: 20, max: 30 },
        { label: '30 – 45 (Adequate Supply)', color: '#0284c7', min: 30, max: 45 },
        { label: '≥ 45 (High Density Hub)', color: '#059669', min: 45, max: 9999 },
      ];
    case 'pop_per_clinic':
      return [
        { label: '> 8,500 pop / clinic', color: '#dc2626', min: 8500, max: 999999 },
        { label: '5,000 – 8,500', color: '#ea580c', min: 5000, max: 8500 },
        { label: '3,300 – 5,000', color: '#d97706', min: 3300, max: 5000 },
        { label: '2,200 – 3,300', color: '#0284c7', min: 2200, max: 3300 },
        { label: '< 2,200 pop / clinic', color: '#059669', min: 0, max: 2200 },
      ];
    case 'total_clinics':
      return [
        { label: '< 15 clinics', color: '#dc2626', min: 0, max: 15 },
        { label: '15 – 22 clinics', color: '#ea580c', min: 15, max: 22 },
        { label: '23 – 28 clinics', color: '#d97706', min: 23, max: 28 },
        { label: '29 – 34 clinics', color: '#0284c7', min: 29, max: 34 },
        { label: '≥ 35 clinics', color: '#059669', min: 35, max: 999 },
      ];
    case 'total_pop':
      return [
        { label: '< 50,000', color: '#0284c7', min: 0, max: 50000 },
        { label: '50k – 80k', color: '#059669', min: 50000, max: 80000 },
        { label: '80k – 110k', color: '#d97706', min: 80000, max: 110000 },
        { label: '110k – 130k', color: '#ea580c', min: 110000, max: 130000 },
        { label: '> 130,000', color: '#dc2626', min: 130000, max: 999999 },
      ];
  }
}

export function getDistrictColor(
  value: number,
  metric: DensityMetricType
): string {
  if (metric === 'pop_per_clinic') {
    // Reverse scale: higher population per clinic is worse (red)
    if (value >= 8500) return '#dc2626';
    if (value >= 5000) return '#ea580c';
    if (value >= 3300) return '#d97706';
    if (value >= 2200) return '#0284c7';
    return '#059669';
  }

  const steps = getLegendSteps(metric);
  for (const step of steps) {
    if (value >= step.min && value < step.max) {
      return step.color;
    }
  }
  return steps[steps.length - 1]?.color || '#0284c7';
}
