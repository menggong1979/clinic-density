/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { District, Clinic, FilterState, ProposedClinicInput } from './types/clinic';
import { SINGAPORE_PLANNING_AREAS, SINGAPORE_CLINICS, SINGAPORE_CLUSTERS } from './data/mockData';
import { exportDistrictsToCSV } from './services/api';
import { isPointInPolygon } from './utils/geoUtils';
import { Header } from './components/Header';
import { ClinicMap } from './components/Map/ClinicMap';
import { MapLegend } from './components/Map/MapLegend';
import { MapToolbar } from './components/Map/MapToolbar';
import { DistrictDetailDrawer } from './components/Sidebar/DistrictDetailDrawer';
import { SimulationModal } from './components/Sidebar/SimulationModal';
import { RankingsTable } from './components/Views/RankingsTable';
import { AnalyticsView } from './components/Views/AnalyticsView';
import { BackendSpecModal } from './components/Views/BackendSpecModal';

export default function App() {
  const [activeView, setActiveView] = useState<'map' | 'rankings' | 'analytics' | 'backend'>('map');

  // Filters and map state aligned with OneMap Singapore
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedTypes: [],
    metric: 'per_10k',
    desertThreshold: 2.8, // Singapore standard target: ~2.8 clinics per 10k residents
    showClinicPins: true,
    showCatchmentBuffers: true,
    showHeatmap: false,
    showDesertHighlight: true,
    selectedBasemap: 'onemap_night' as any,
    selectedRegionDataset: 'planning_areas' as any,
  });

  // Base datasets: Singapore URA Planning Areas and Clinics
  const [districts, setDistricts] = useState<District[]>(SINGAPORE_PLANNING_AREAS);
  const [clinics, setClinics] = useState<Clinic[]>(SINGAPORE_CLINICS);
  const [simulatedClinics, setSimulatedClinics] = useState<Clinic[]>([]);

  // Selection & Modal States
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [isSimulatingPlacement, setIsSimulatingPlacement] = useState<boolean>(false);
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState<boolean>(false);
  const [simulationCoords, setSimulationCoords] = useState<{ lat: number; lng: number } | undefined>();
  const [simulationDistrictId, setSimulationDistrictId] = useState<string | undefined>();

  // Switch region dataset when filter changes
  useEffect(() => {
    if (filters.selectedRegionDataset === 'clusters') {
      setDistricts(SINGAPORE_CLUSTERS);
      setSelectedDistrict(null);
    } else {
      setDistricts(SINGAPORE_PLANNING_AREAS);
      setSelectedDistrict(null);
    }
  }, [filters.selectedRegionDataset]);

  // Combined clinics: base verified clinics + user-simulated clinics
  const allClinics = [...clinics, ...simulatedClinics];

  // Handle map click when simulation placement is active
  const handleMapClickForPlacement = (lat: number, lng: number) => {
    // Find enclosing Singapore planning area
    const matchingDistrict = districts.find(d => {
      return isPointInPolygon([lat, lng], d.coordinates[0]);
    });

    setSimulationCoords({ lat, lng });
    setSimulationDistrictId(matchingDistrict?.id || districts[0]?.id);
    setIsSimulationModalOpen(true);
    setIsSimulatingPlacement(false);
  };

  // Add proposed clinic to simulation state
  const handleAddProposedClinic = (input: ProposedClinicInput) => {
    const newClinic: Clinic = {
      id: `sim-${Date.now()}`,
      name: input.name,
      type: input.type,
      districtId: input.districtId,
      address: `Simulated Site (${input.latitude.toFixed(4)}, ${input.longitude.toFixed(4)})`,
      postalCode: 'Provisional',
      mrtStation: 'Adjacent Planned Transit',
      latitude: input.latitude,
      longitude: input.longitude,
      phone: '+65 (Provisional)',
      hours: 'Mon-Fri 8:30am - 9:00pm',
      acceptsMedicaid: input.acceptsMedicaid,
      chasTier: 'CHAS All Tiers',
      healthierSgEnrolled: true,
      isEmergency: false,
      staffPhysicians: input.staffPhysicians,
      isSimulated: true,
    };

    setSimulatedClinics(prev => [newClinic, ...prev]);

    const affectedDistrict = districts.find(d => d.id === input.districtId);
    if (affectedDistrict) {
      setSelectedDistrict(affectedDistrict);
    }
  };

  const handleRemoveSimulatedClinic = (clinicId: string) => {
    setSimulatedClinics(prev => prev.filter(c => c.id !== clinicId));
  };

  const handleResetSimulations = () => {
    setSimulatedClinics([]);
  };

  const handleExportCSV = () => {
    exportDistrictsToCSV(districts, allClinics, filters.desertThreshold);
  };

  const handleProposeClinicForDistrict = (districtId: string) => {
    const d = districts.find(item => item.id === districtId);
    if (d) {
      setSimulationDistrictId(d.id);
      setSimulationCoords({ lat: d.center[0], lng: d.center[1] });
      setIsSimulationModalOpen(true);
    }
  };

  const handleLoadCustomData = (customDistricts: District[], customClinics: Clinic[]) => {
    setDistricts(customDistricts);
    if (customClinics.length > 0) {
      setClinics(customClinics);
    }
    setSelectedDistrict(null);
    setActiveView('map');
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 select-none">
      {/* Top Header */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenSimulation={() => {
          setSimulationCoords(undefined);
          setSimulationDistrictId(selectedDistrict?.id || districts[0]?.id);
          setIsSimulationModalOpen(true);
        }}
        onExportCSV={handleExportCSV}
        simulatedCount={simulatedClinics.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 relative flex overflow-hidden">
        {activeView === 'map' && (
          <>
            {/* Map Canvas */}
            <div className="flex-1 relative h-full w-full">
              {/* Floating Top Toolbar */}
              <div className="absolute top-4 left-4 right-4 z-20 pointer-events-auto">
                <MapToolbar
                  filters={filters}
                  setFilters={setFilters}
                  districts={districts}
                  clinics={allClinics}
                  onSelectDistrict={(d) => setSelectedDistrict(d)}
                  isSimulatingPlacement={isSimulatingPlacement}
                  setIsSimulatingPlacement={setIsSimulatingPlacement}
                />
              </div>

              {/* Floating Bottom-Left Legend */}
              <div className="absolute bottom-6 left-6 z-20 pointer-events-auto">
                <MapLegend filters={filters} setFilters={setFilters} />
              </div>

              {/* OneMap Leaflet Canvas */}
              <ClinicMap
                districts={districts}
                clinics={allClinics}
                selectedDistrict={selectedDistrict}
                onSelectDistrict={(d) => setSelectedDistrict(d)}
                filters={filters}
                isSimulatingPlacement={isSimulatingPlacement}
                onMapClickForPlacement={handleMapClickForPlacement}
                onOpenSimulation={() => setIsSimulationModalOpen(true)}
              />
            </div>

            {/* Right District Detail Inspector Drawer */}
            {selectedDistrict && (
              <DistrictDetailDrawer
                district={selectedDistrict}
                clinics={allClinics}
                filters={filters}
                onClose={() => setSelectedDistrict(null)}
                onProposeClinicForDistrict={handleProposeClinicForDistrict}
              />
            )}
          </>
        )}

        {/* District Rankings View */}
        {activeView === 'rankings' && (
          <RankingsTable
            districts={districts}
            clinics={allClinics}
            filters={filters}
            onSelectDistrict={(d) => {
              setSelectedDistrict(d);
              setActiveView('map');
            }}
            onExportCSV={handleExportCSV}
          />
        )}

        {/* Equity Analytics View */}
        {activeView === 'analytics' && (
          <AnalyticsView
            districts={districts}
            clinics={allClinics}
            filters={filters}
            onSelectDistrict={(d) => {
              setSelectedDistrict(d);
              setActiveView('map');
            }}
          />
        )}

        {/* Backend API Spec View */}
        {activeView === 'backend' && (
          <BackendSpecModal onLoadCustomData={handleLoadCustomData} />
        )}
      </div>

      {/* Simulation Placement Modal */}
      <SimulationModal
        isOpen={isSimulationModalOpen}
        onClose={() => setIsSimulationModalOpen(false)}
        districts={districts}
        clinics={allClinics}
        defaultDistrictId={simulationDistrictId}
        defaultCoords={simulationCoords}
        onAddClinic={handleAddProposedClinic}
        onRemoveSimulatedClinic={handleRemoveSimulatedClinic}
        onResetSimulations={handleResetSimulations}
        simulatedClinics={simulatedClinics}
        desertThreshold={filters.desertThreshold}
      />
    </div>
  );
}
