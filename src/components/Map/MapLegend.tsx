import React, { useState } from 'react';
import { FilterState, ClinicType } from '../../types/clinic';
import { getLegendSteps } from '../../utils/mapStyles';
import { CLINIC_TYPE_LABELS } from '../../data/mockData';
import { ChevronDown, ChevronUp, Layers, Eye, EyeOff } from 'lucide-react';

interface MapLegendProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

export const MapLegend: React.FC<MapLegendProps> = ({ filters, setFilters }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const steps = getLegendSteps(filters.metric);

  const toggleClinicType = (type: ClinicType) => {
    setFilters(prev => {
      const exists = prev.selectedTypes.includes(type);
      const newTypes = exists
        ? prev.selectedTypes.filter(t => t !== type)
        : [...prev.selectedTypes, type];
      return { ...prev, selectedTypes: newTypes };
    });
  };

  const selectAllTypes = () => {
    setFilters(prev => ({
      ...prev,
      selectedTypes: Object.keys(CLINIC_TYPE_LABELS) as ClinicType[],
    }));
  };

  const clearAllTypes = () => {
    setFilters(prev => ({
      ...prev,
      selectedTypes: [],
    }));
  };

  return (
    <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl p-3.5 text-xs text-slate-300 w-72 max-w-[calc(100vw-32px)] transition-all">
      {/* Header with collapse toggle */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-semibold text-slate-100 text-xs tracking-tight">
            Map Legend & Density Scale
          </span>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-slate-400 hover:text-slate-200 transition-colors p-0.5 rounded"
          title={isCollapsed ? 'Expand Legend' : 'Collapse Legend'}
        >
          {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="space-y-3.5">
          {/* Choropleth scale */}
          <div>
            <div className="text-[11px] font-medium text-slate-400 mb-1.5 flex items-center justify-between">
              <span>District Density Scale</span>
              <span className="font-mono text-[10px] text-slate-500">
                {filters.metric === 'per_10k' ? 'per 10k residents' : filters.metric === 'per_100k' ? 'per 100k residents' : 'metric steps'}
              </span>
            </div>

            <div className="space-y-1">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div
                    className="w-4 h-3 rounded-xs shrink-0 border border-black/20"
                    style={{ backgroundColor: step.color }}
                  />
                  <span className="text-[11px] font-mono tabular-nums text-slate-300 truncate">
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Layer toggles */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="text-[11px] font-medium text-slate-400 mb-1.5">
              Geospatial Layers
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center justify-between cursor-pointer hover:text-white transition-colors">
                <span className="text-[11px]">Clinic Pins</span>
                <input
                  type="checkbox"
                  checked={filters.showClinicPins}
                  onChange={(e) => setFilters(f => ({ ...f, showClinicPins: e.target.checked }))}
                  className="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-sky-500 w-3.5 h-3.5"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer hover:text-white transition-colors">
                <span className="text-[11px]">15-min Catchment Buffer (1.2km)</span>
                <input
                  type="checkbox"
                  checked={filters.showCatchmentBuffers}
                  onChange={(e) => setFilters(f => ({ ...f, showCatchmentBuffers: e.target.checked }))}
                  className="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-sky-500 w-3.5 h-3.5"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer hover:text-white transition-colors">
                <span className="text-[11px] flex items-center gap-1">
                  <span>Healthcare Desert Outlines</span>
                  <span className="text-red-400 font-mono text-[10px]">(&lt;{filters.desertThreshold})</span>
                </span>
                <input
                  type="checkbox"
                  checked={filters.showDesertHighlight}
                  onChange={(e) => setFilters(f => ({ ...f, showDesertHighlight: e.target.checked }))}
                  className="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-sky-500 w-3.5 h-3.5"
                />
              </label>
            </div>
          </div>

          {/* Clinic Types filter */}
          {filters.showClinicPins && (
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-slate-400">Clinic Specialties</span>
                <div className="flex items-center gap-2 text-[10px]">
                  <button onClick={selectAllTypes} className="text-sky-400 hover:underline">All</button>
                  <span className="text-slate-600">·</span>
                  <button onClick={clearAllTypes} className="text-slate-400 hover:underline">None</button>
                </div>
              </div>

              <div className="space-y-1">
                {(Object.entries(CLINIC_TYPE_LABELS) as [ClinicType, { label: string; color: string }][]).map(
                  ([type, info]) => {
                    const isChecked = filters.selectedTypes.length === 0 || filters.selectedTypes.includes(type);
                    return (
                      <button
                        key={type}
                        onClick={() => toggleClinicType(type)}
                        className={`w-full flex items-center justify-between px-1.5 py-1 rounded text-left transition-colors ${
                          isChecked ? 'bg-slate-800/60 text-slate-200' : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: info.color }}
                          />
                          <span className="text-[11px] truncate">{info.label}</span>
                        </div>
                        {isChecked ? (
                          <Eye className="w-3 h-3 text-slate-400 shrink-0" />
                        ) : (
                          <EyeOff className="w-3 h-3 text-slate-600 shrink-0" />
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
