import React, { useState } from 'react';
import { District, Clinic, ClinicType, ProposedClinicInput } from '../../types/clinic';
import { CLINIC_TYPE_LABELS } from '../../data/mockData';
import { X, Sparkles, Plus, Trash2, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  districts: District[];
  clinics: Clinic[];
  defaultDistrictId?: string;
  defaultCoords?: { lat: number; lng: number };
  onAddClinic: (clinic: ProposedClinicInput) => void;
  onRemoveSimulatedClinic: (clinicId: string) => void;
  onResetSimulations: () => void;
  simulatedClinics: Clinic[];
  desertThreshold: number;
}

export const SimulationModal: React.FC<SimulationModalProps> = ({
  isOpen,
  onClose,
  districts,
  clinics,
  defaultDistrictId,
  defaultCoords,
  onAddClinic,
  onRemoveSimulatedClinic,
  onResetSimulations,
  simulatedClinics,
  desertThreshold,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('Prototyped Health Center');
  const [selectedType, setSelectedType] = useState<ClinicType>('primary_care');
  const [districtId, setDistrictId] = useState(defaultDistrictId || districts[0]?.id || '');
  const [lat, setLat] = useState(defaultCoords?.lat ? defaultCoords.lat.toFixed(4) : '37.7400');
  const [lng, setLng] = useState(defaultCoords?.lng ? defaultCoords.lng.toFixed(4) : '-122.4100');
  const [staffCount, setStaffCount] = useState(5);
  const [acceptsMedicaid, setAcceptsMedicaid] = useState(true);

  // Target district calculations
  const targetDistrict = districts.find(d => d.id === districtId) || districts[0];
  const targetDistrictClinics = clinics.filter(c => c.districtId === targetDistrict?.id);
  const currentCount = targetDistrictClinics.length;
  const currentDensity = targetDistrict ? (currentCount / targetDistrict.population) * 10000 : 0;

  // After addition
  const projectedCount = currentCount + 1;
  const projectedDensity = targetDistrict ? (projectedCount / targetDistrict.population) * 10000 : 0;
  const wasDesert = currentDensity < desertThreshold;
  const willBeDesert = projectedDensity < desertThreshold;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDistrict) return;

    onAddClinic({
      name,
      type: selectedType,
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      districtId: targetDistrict.id,
      staffPhysicians: staffCount,
      acceptsMedicaid,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Simulate Clinic Placement
              </h3>
              <p className="text-xs text-slate-400">
                Model impact on population density ratio and healthcare desert mitigation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-300">
          <form id="clinic-simulation-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Facility Name */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Facility / Clinic Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500 text-xs"
                placeholder="e.g. South Bay Community Clinic"
              />
            </div>

            {/* Specialty / Type */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Clinical Specialization
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as ClinicType)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500 text-xs"
              >
                {(Object.entries(CLINIC_TYPE_LABELS) as [ClinicType, { label: string }][]).map(
                  ([type, info]) => (
                    <option key={type} value={type}>
                      {info.label}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Target District */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Assign to Health District
              </label>
              <select
                value={districtId}
                onChange={(e) => {
                  setDistrictId(e.target.value);
                  const d = districts.find(item => item.id === e.target.value);
                  if (d) {
                    setLat(d.center[0].toFixed(4));
                    setLng(d.center[1].toFixed(4));
                  }
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500 text-xs"
              >
                {districts.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.code} - {d.name} (Pop: {d.population.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Coordinates Lat & Lng */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Latitude
                </label>
                <input
                  type="text"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Longitude
                </label>
                <input
                  type="text"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500 text-xs font-mono"
                />
              </div>
            </div>

            {/* Staff & Medicaid */}
            <div className="grid grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Physicians on Staff
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={staffCount}
                  onChange={(e) => setStaffCount(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500 text-xs font-mono"
                />
              </div>

              <div className="pt-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptsMedicaid}
                    onChange={(e) => setAcceptsMedicaid(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-sky-500 w-4 h-4"
                  />
                  <span className="text-slate-200">Accepts Medicaid / Medicare</span>
                </label>
              </div>
            </div>

            {/* Live Impact Preview Card */}
            {targetDistrict && (
              <div className="p-3.5 rounded-lg bg-sky-950/30 border border-sky-800/60 space-y-2">
                <div className="text-[11px] font-semibold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Projected Density Impact: {targetDistrict.name}</span>
                </div>

                <div className="flex items-center justify-between text-xs py-1 border-b border-sky-900/50">
                  <span className="text-slate-400">Clinics Count:</span>
                  <div className="flex items-center gap-2 font-mono tabular-nums">
                    <span>{currentCount}</span>
                    <ArrowRight className="w-3 h-3 text-sky-400" />
                    <span className="text-sky-300 font-bold">{projectedCount}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs py-1 border-b border-sky-900/50">
                  <span className="text-slate-400">Clinics / 10k Pop:</span>
                  <div className="flex items-center gap-2 font-mono tabular-nums">
                    <span>{currentDensity.toFixed(2)}</span>
                    <ArrowRight className="w-3 h-3 text-sky-400" />
                    <span className="text-sky-300 font-bold">{projectedDensity.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-slate-400">Desert Status:</span>
                  <div>
                    {wasDesert && !willBeDesert ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Desert Resolved!
                      </span>
                    ) : willBeDesert ? (
                      <span className="text-amber-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Remaining in Shortage
                      </span>
                    ) : (
                      <span className="text-emerald-400">Adequate Supply</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* Already simulated clinics list */}
          {simulatedClinics.length > 0 && (
            <div className="pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-300 text-xs">
                  Active Simulated Placements ({simulatedClinics.length})
                </span>
                <button
                  type="button"
                  onClick={onResetSimulations}
                  className="text-[11px] text-red-400 hover:text-red-300 transition-colors"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {simulatedClinics.map(c => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{c.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {districts.find(d => d.id === c.districtId)?.name} · {c.staffPhysicians} doctors
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveSimulatedClinic(c.id)}
                      className="text-slate-500 hover:text-red-400 p-1"
                      title="Remove simulation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-end gap-2.5 bg-slate-950/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="clinic-simulation-form"
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Place Simulated Clinic</span>
          </button>
        </div>
      </div>
    </div>
  );
};
