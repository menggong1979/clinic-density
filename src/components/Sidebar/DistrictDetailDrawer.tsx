import React from 'react';
import { District, Clinic, FilterState, ClinicType } from '../../types/clinic';
import { CLINIC_TYPE_LABELS } from '../../data/mockData';
import { X, Plus, AlertTriangle, CheckCircle, Phone, MapPin, Building2, Train } from 'lucide-react';

interface DistrictDetailDrawerProps {
  district: District;
  clinics: Clinic[];
  filters: FilterState;
  onClose: () => void;
  onProposeClinicForDistrict: (districtId: string) => void;
}

export const DistrictDetailDrawer: React.FC<DistrictDetailDrawerProps> = ({
  district,
  clinics,
  filters,
  onClose,
  onProposeClinicForDistrict,
}) => {
  const districtClinics = clinics.filter(c => c.districtId === district.id);
  const totalClinics = districtClinics.length;
  const density10k = district.population > 0 ? (totalClinics / district.population) * 10000 : 0;
  const density100k = district.population > 0 ? (totalClinics / district.population) * 100000 : 0;
  const popPerClinic = totalClinics > 0 ? Math.round(district.population / totalClinics) : district.population;
  
  const isDesert = density10k < filters.desertThreshold;
  const targetClinics = Math.ceil((filters.desertThreshold * district.population) / 10000);
  const deficit = Math.max(0, targetClinics - totalClinics);

  // Group clinics by specialty
  const specialtyCounts: Partial<Record<ClinicType, number>> = {};
  districtClinics.forEach(c => {
    specialtyCounts[c.type] = (specialtyCounts[c.type] || 0) + 1;
  });

  return (
    <div className="w-96 max-w-full bg-slate-900 border-l border-slate-800 h-full flex flex-col z-20 shadow-2xl overflow-hidden shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-start justify-between gap-3 bg-slate-950/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-sky-400 font-semibold">{district.code}</span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">{district.areaSqKm} km²</span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-emerald-400">Singapore URA</span>
          </div>
          <h2 className="text-base font-bold text-white tracking-tight mt-0.5 leading-snug">
            {district.name}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          title="Close details"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content scroll area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-slate-300">
        {/* Healthcare Coverage Status Alert */}
        <div
          className={`p-3 rounded-lg border flex items-start gap-3 ${
            isDesert
              ? 'bg-red-950/30 border-red-900/60 text-red-200'
              : 'bg-emerald-950/30 border-emerald-900/60 text-emerald-200'
          }`}
        >
          {isDesert ? (
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          )}
          <div className="text-xs">
            <div className="font-semibold text-white">
              {isDesert ? 'Underserved Planning Area' : 'Adequate Primary Care Capacity'}
            </div>
            <div className="mt-0.5 leading-relaxed text-[11px] opacity-90">
              {isDesert
                ? `Clinic density is ${density10k.toFixed(2)} / 10k, trailing the national benchmark of ${filters.desertThreshold.toFixed(1)} / 10k. Deficit of ${deficit} clinics needed for Healthier SG coverage.`
                : `Clinic density of ${density10k.toFixed(2)} / 10k meets the national target benchmark of ${filters.desertThreshold.toFixed(1)} / 10k.`}
            </div>
          </div>
        </div>

        {/* Primary Density & Population Metrics */}
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Density & Accessibility Ratios
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg">
              <div className="text-slate-400 text-[11px]">Clinics / 10k Residents</div>
              <div className="text-xl font-bold font-mono text-white mt-0.5 tabular-nums">
                {density10k.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Benchmark: {filters.desertThreshold.toFixed(1)} / 10k</div>
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg">
              <div className="text-slate-400 text-[11px]">Residents / Clinic</div>
              <div className="text-xl font-bold font-mono text-white mt-0.5 tabular-nums">
                {popPerClinic.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Residents per facility</div>
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg">
              <div className="text-slate-400 text-[11px]">Resident Pop (SingStat)</div>
              <div className="text-base font-bold font-mono text-white mt-0.5 tabular-nums">
                {district.population.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                {(district.population / district.areaSqKm).toFixed(0)} residents/km²
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg">
              <div className="text-slate-400 text-[11px]">Verified Facilities</div>
              <div className="text-base font-bold font-mono text-white mt-0.5 tabular-nums flex items-baseline gap-1.5">
                <span>{totalClinics}</span>
                {districtClinics.some(c => c.isSimulated) && (
                  <span className="text-[10px] font-normal text-sky-400 font-sans">(includes simulated)</span>
                )}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">{density100k.toFixed(1)} / 100k</div>
            </div>
          </div>
        </div>

        {/* Demographics & Public Housing Factors */}
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Demographic & Housing Profile
          </div>
          <div className="space-y-2 text-xs bg-slate-950/60 border border-slate-800/80 p-3 rounded-lg">
            <div>
              <div className="flex justify-between text-slate-400 mb-1 text-[11px]">
                <span>Seniors 65+ Years (Chronic Care Need)</span>
                <span className="font-mono text-white tabular-nums">{district.demographics.seniorsPercent}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, district.demographics.seniorsPercent * 3)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1 text-[11px]">
                <span>CHAS Blue Subsidy Eligible Proportion</span>
                <span className="font-mono text-white tabular-nums">{district.demographics.uninsuredRate}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, district.demographics.uninsuredRate * 2.5)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1 text-[11px]">
                <span>Residents Living in HDB Flats</span>
                <span className="font-mono text-white tabular-nums">{district.demographics.hdbResidentPercent || 80}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full"
                  style={{ width: `${district.demographics.hdbResidentPercent || 80}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Specialty Distribution */}
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Specialty Mix ({totalClinics} facilities)
          </div>
          <div className="space-y-1.5 text-xs">
            {(Object.entries(CLINIC_TYPE_LABELS) as [ClinicType, { label: string; color: string }][]).map(
              ([type, info]) => {
                const count = specialtyCounts[type] || 0;
                return (
                  <div
                    key={type}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800/60"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: info.color }} />
                      <span className="text-[11px] text-slate-300">{info.label}</span>
                    </div>
                    <span className="font-mono font-semibold text-white text-[11px] tabular-nums">
                      {count}
                    </span>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Facilities Directory */}
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Verified Facilities in {district.name.replace(' Planning Area', '')} ({districtClinics.length})
          </div>
          <div className="space-y-2">
            {districtClinics.map(clinic => {
              const typeInfo = CLINIC_TYPE_LABELS[clinic.type];
              return (
                <div
                  key={clinic.id}
                  className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-white leading-snug">{clinic.name}</div>
                    {clinic.isSimulated && (
                      <span className="px-1.5 py-0.5 text-[9px] bg-sky-950 text-sky-400 border border-sky-800 rounded font-bold uppercase shrink-0">
                        Simulated
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-medium mt-1 flex items-center gap-2" style={{ color: typeInfo?.color || '#38bdf8' }}>
                    <span>{typeInfo?.label}</span>
                    {clinic.healthierSgEnrolled && (
                      <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/50 px-1 py-0.2 rounded border border-emerald-800/40">
                        ✓ Healthier SG
                      </span>
                    )}
                  </div>
                  <div className="text-slate-400 text-[11px] mt-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">
                      {clinic.address} {clinic.postalCode ? `(S${clinic.postalCode})` : ''}
                    </span>
                  </div>
                  {clinic.mrtStation && (
                    <div className="text-sky-400/90 text-[11px] mt-1 flex items-center gap-1.5">
                      <Train className="w-3 h-3 text-sky-400 shrink-0" />
                      <span>MRT: {clinic.mrtStation}</span>
                    </div>
                  )}
                  <div className="text-slate-400 text-[11px] mt-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>{clinic.phone}</span>
                    </span>
                    <span className="font-mono text-slate-300">
                      {clinic.staffPhysicians} doctors
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950/70 shrink-0">
        <button
          onClick={() => onProposeClinicForDistrict(district.id)}
          className="w-full py-2 px-3 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Propose Clinic in {district.name.replace(' Planning Area', '')}</span>
        </button>
      </div>
    </div>
  );
};
