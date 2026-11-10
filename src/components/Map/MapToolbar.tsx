import React from 'react';
import { FilterState, DensityMetricType, District, Clinic } from '../../types/clinic';
import { Search, Map, Sparkles, AlertTriangle } from 'lucide-react';

interface MapToolbarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  districts: District[];
  clinics: Clinic[];
  onSelectDistrict: (district: District | null) => void;
  isSimulatingPlacement: boolean;
  setIsSimulatingPlacement: (val: boolean) => void;
}

export const MapToolbar: React.FC<MapToolbarProps> = ({
  filters,
  setFilters,
  districts,
  clinics,
  onSelectDistrict,
  isSimulatingPlacement,
  setIsSimulatingPlacement,
}) => {
  const desertCount = districts.filter(d => {
    const districtClinics = clinics.filter(c => c.districtId === d.id);
    const count = districtClinics.length || d.clinicsCount;
    const density10k = d.population > 0 ? (count / d.population) * 10000 : 0;
    return density10k < filters.desertThreshold;
  }).length;

  const metrics: { id: DensityMetricType; label: string }[] = [
    { id: 'per_10k', label: 'Clinics / 10k Pop' },
    { id: 'per_100k', label: 'Clinics / 100k Pop' },
    { id: 'pop_per_clinic', label: 'Residents / Clinic' },
    { id: 'total_clinics', label: 'Total Facilities' },
    { id: 'total_pop', label: 'Resident Pop' },
  ];

  return (
    <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-200">
      {/* Metric Segmented Control */}
      <div className="flex items-center gap-1 p-1 bg-slate-950/70 border border-slate-800 rounded-lg">
        {metrics.map(m => (
          <button
            key={m.id}
            onClick={() => setFilters(f => ({ ...f, metric: m.id }))}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filters.metric === m.id
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Middle controls: Desert Threshold slider & OneMap Base Map Switcher */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Shortage Threshold */}
        <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 px-3 py-1.5 rounded-lg">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-[11px] text-slate-400 whitespace-nowrap">Shortage Threshold:</span>
          <input
            type="range"
            min="1.0"
            max="4.0"
            step="0.1"
            value={filters.desertThreshold}
            onChange={(e) => setFilters(f => ({ ...f, desertThreshold: parseFloat(e.target.value) }))}
            className="w-18 accent-sky-500 cursor-pointer"
          />
          <span className="font-mono text-white text-[11px] font-bold w-12 tabular-nums">
            {filters.desertThreshold.toFixed(1)} /10k
          </span>
          <span className="text-[10px] text-red-400 font-mono whitespace-nowrap">
            ({desertCount} underserved)
          </span>
        </div>

        {/* Singapore Division Dataset Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-800 px-2.5 py-1.5 rounded-lg">
          <span className="text-[11px] text-slate-400 whitespace-nowrap">Division:</span>
          <select
            value={filters.selectedRegionDataset}
            onChange={(e) => setFilters(f => ({ ...f, selectedRegionDataset: e.target.value as any }))}
            className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer text-xs"
          >
            <option value="planning_areas" className="bg-slate-900 text-slate-200">URA Planning Areas (SingStat Census)</option>
            <option value="clusters" className="bg-slate-900 text-slate-200">3 Regional Clusters (SingHealth, NHG, NUHS)</option>
          </select>
        </div>

        {/* OneMap SLA Basemap Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-800 px-2.5 py-1.5 rounded-lg">
          <Map className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-[11px] text-slate-400">OneMap:</span>
          <select
            value={filters.selectedBasemap}
            onChange={(e) => setFilters(f => ({ ...f, selectedBasemap: e.target.value as any }))}
            className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer text-xs"
          >
            <option value="onemap_night" className="bg-slate-900 text-slate-200">OneMap Night (Dark)</option>
            <option value="onemap_default" className="bg-slate-900 text-slate-200">OneMap Default (SLA Color)</option>
            <option value="onemap_grey" className="bg-slate-900 text-slate-200">OneMap Grey (Minimal)</option>
            <option value="onemap_original" className="bg-slate-900 text-slate-200">OneMap Original</option>
            <option value="satellite" className="bg-slate-900 text-slate-200">Satellite Imagery</option>
          </select>
        </div>
      </div>

      {/* Right controls: Planning Area Quick Search & Simulation Placement Toggle */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <select
            defaultValue=""
            onChange={(e) => {
              const d = districts.find(item => item.id === e.target.value);
              onSelectDistrict(d || null);
            }}
            className="pl-8 pr-3 py-1.5 bg-slate-950/70 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 text-xs cursor-pointer max-w-[170px] truncate"
          >
            <option value="">Jump to Planning Area...</option>
            {districts.map(d => (
              <option key={d.id} value={d.id} className="bg-slate-900 text-slate-200">
                {d.code} - {d.name.replace(' Planning Area', '')}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setIsSimulatingPlacement(!isSimulatingPlacement)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap border ${
            isSimulatingPlacement
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
              : 'bg-slate-800 text-sky-400 border-slate-700 hover:bg-slate-700/80'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isSimulatingPlacement ? 'Cancel Pin' : 'Drop Clinic in SG'}</span>
        </button>
      </div>
    </div>
  );
};
