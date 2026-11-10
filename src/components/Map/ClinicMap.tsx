import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { District, Clinic, FilterState } from '../../types/clinic';
import { CLINIC_TYPE_LABELS } from '../../data/mockData';
import { getMetricValue, getDistrictColor } from '../../utils/mapStyles';
import { ZoomIn, ZoomOut, Maximize2, Plus } from 'lucide-react';

interface ClinicMapProps {
  districts: District[];
  clinics: Clinic[];
  selectedDistrict: District | null;
  onSelectDistrict: (district: District | null) => void;
  filters: FilterState;
  isSimulatingPlacement: boolean;
  onMapClickForPlacement?: (lat: number, lng: number) => void;
  onOpenSimulation: () => void;
}

export const ClinicMap: React.FC<ClinicMapProps> = ({
  districts,
  clinics,
  selectedDistrict,
  onSelectDistrict,
  filters,
  isSimulatingPlacement,
  onMapClickForPlacement,
  onOpenSimulation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const polygonsLayerRef = useRef<L.FeatureGroup | null>(null);
  const markersLayerRef = useRef<L.FeatureGroup | null>(null);
  const buffersLayerRef = useRef<L.FeatureGroup | null>(null);

  // Basemap URLs
  const basemaps: Record<string, { url: string; attribution: string }> = {
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; CartoDB &copy; OpenStreetMap contributors',
    },
    light: {
      url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; CartoDB &copy; OpenStreetMap contributors',
    },
    streets: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors',
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri, Maxar, Earthstar Geographics',
    },
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialCenter: [number, number] = [37.755, -122.435];
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 12,
      zoomControl: false,
      attributionControl: false,
    });

    const currentBasemap = basemaps[filters.selectedBasemap] || basemaps.dark;
    const tiles = L.tileLayer(currentBasemap.url, {
      maxZoom: 19,
      attribution: currentBasemap.attribution,
    }).addTo(map);

    tileLayerRef.current = tiles;
    polygonsLayerRef.current = L.featureGroup().addTo(map);
    buffersLayerRef.current = L.featureGroup().addTo(map);
    markersLayerRef.current = L.featureGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Basemap when filter changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const config = basemaps[filters.selectedBasemap] || basemaps.dark;
    tileLayerRef.current.setUrl(config.url);
  }, [filters.selectedBasemap]);

  // Click on map to drop proposed clinic
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      if (isSimulatingPlacement && onMapClickForPlacement) {
        onMapClickForPlacement(e.latlng.lat, e.latlng.lng);
      }
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [isSimulatingPlacement, onMapClickForPlacement]);

  // Render District Polygons (Choropleth Layer)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = polygonsLayerRef.current;
    if (!map || !group) return;

    group.clearLayers();

    districts.forEach(district => {
      const metricVal = getMetricValue(district, clinics, filters.metric);
      const districtClinics = clinics.filter(c => c.districtId === district.id);
      const count = districtClinics.length;
      const density10k = district.population > 0 ? (count / district.population) * 10000 : 0;
      const isDesert = density10k < filters.desertThreshold;
      const isSelected = selectedDistrict?.id === district.id;

      const fillColor = getDistrictColor(metricVal, filters.metric);

      // Coordinates for leaflet: [[lat, lng], [lat, lng], ...]
      const latLngs = district.coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number]);

      const polygon = L.polygon(latLngs, {
        color: isSelected
          ? '#38bdf8'
          : isDesert && filters.showDesertHighlight
          ? '#ef4444'
          : '#334155',
        weight: isSelected ? 3.5 : isDesert && filters.showDesertHighlight ? 2 : 1.2,
        dashArray: isDesert && filters.showDesertHighlight && !isSelected ? '4, 4' : undefined,
        fillColor: fillColor,
        fillOpacity: isSelected ? 0.75 : 0.5,
      });

      // Tooltip
      const tooltipContent = `
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4; min-width: 170px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid #334155; padding-bottom: 4px; margin-bottom: 6px;">
            <strong style="color: #ffffff; font-size: 13px;">${district.name}</strong>
            <span style="color: #94a3b8; font-family: monospace; font-size: 11px;">${district.code}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px; color: #cbd5e1;">
            <span>Population:</span>
            <strong style="color: #ffffff; font-family: monospace;">${district.population.toLocaleString()}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px; color: #cbd5e1;">
            <span>Verified Clinics:</span>
            <strong style="color: #ffffff; font-family: monospace;">${count}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #cbd5e1;">
            <span>Density (per 10k):</span>
            <strong style="color: ${isDesert ? '#f87171' : '#38bdf8'}; font-family: monospace; font-weight: 700;">${density10k.toFixed(2)}</strong>
          </div>
          ${
            isDesert
              ? `<div style="margin-top: 4px; padding: 2px 6px; background: rgba(220, 38, 38, 0.2); border: 1px solid rgba(220, 38, 38, 0.4); border-radius: 4px; color: #fca5a5; font-size: 11px; text-align: center; font-weight: 600;">⚠️ Healthcare Desert Area</div>`
              : `<div style="margin-top: 4px; color: #34d399; font-size: 11px; text-align: center;">✓ Adequate Health Coverage</div>`
          }
        </div>
      `;

      polygon.bindTooltip(tooltipContent, {
        className: 'density-tooltip',
        sticky: true,
        direction: 'auto',
      });

      // Hover and click behaviors
      polygon.on('mouseover', (e) => {
        const layer = e.target as L.Polygon;
        layer.setStyle({
          weight: 3,
          fillOpacity: 0.8,
          color: '#ffffff',
        });
      });

      polygon.on('mouseout', (e) => {
        const layer = e.target as L.Polygon;
        layer.setStyle({
          color: isSelected
            ? '#38bdf8'
            : isDesert && filters.showDesertHighlight
            ? '#ef4444'
            : '#334155',
          weight: isSelected ? 3.5 : isDesert && filters.showDesertHighlight ? 2 : 1.2,
          fillOpacity: isSelected ? 0.75 : 0.5,
        });
      });

      polygon.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        if (isSimulatingPlacement && onMapClickForPlacement) {
          onMapClickForPlacement(e.latlng.lat, e.latlng.lng);
        } else {
          onSelectDistrict(district);
        }
      });

      group.addLayer(polygon);
    });
  }, [districts, clinics, filters, selectedDistrict, isSimulatingPlacement, onMapClickForPlacement, onSelectDistrict]);

  // Render Clinic Catchment Buffers & Pins
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    const buffersGroup = buffersLayerRef.current;
    if (!map || !markersGroup || !buffersGroup) return;

    markersGroup.clearLayers();
    buffersGroup.clearLayers();

    // Filter clinics based on user selection
    const visibleClinics = clinics.filter(c => 
      filters.selectedTypes.length === 0 || filters.selectedTypes.includes(c.type)
    );

    // 1. Render Catchment Buffers
    if (filters.showCatchmentBuffers) {
      visibleClinics.forEach(c => {
        const circle = L.circle([c.latitude, c.longitude], {
          radius: 1200, // 1.2 km (~15-min walk/transit radius)
          color: c.isSimulated ? '#0ea5e9' : CLINIC_TYPE_LABELS[c.type]?.color || '#38bdf8',
          weight: 1,
          opacity: 0.4,
          fillColor: c.isSimulated ? '#0ea5e9' : CLINIC_TYPE_LABELS[c.type]?.color || '#38bdf8',
          fillOpacity: 0.08,
          dashArray: '2, 3',
        });
        buffersGroup.addLayer(circle);
      });
    }

    // 2. Render Markers
    if (filters.showClinicPins) {
      visibleClinics.forEach(c => {
        const typeInfo = CLINIC_TYPE_LABELS[c.type] || {
          label: 'Clinic',
          color: '#38bdf8',
          badge: '',
        };

        const isSimulated = c.isSimulated;

        // Custom HTML marker pin
        const markerHtml = isSimulated
          ? `<div class="relative flex items-center justify-center w-7 h-7 rounded-full bg-sky-500 text-white shadow-lg border-2 border-white ring-2 ring-sky-400 simulated-pulse-pin cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
            </div>`
          : `<div class="relative flex items-center justify-center w-6 h-6 rounded-full shadow-md border border-white/60 transition-transform hover:scale-125 cursor-pointer" style="background-color: ${typeInfo.color};">
              <span class="w-2 h-2 rounded-full bg-white"></span>
            </div>`;

        const customIcon = L.divIcon({
          className: 'custom-clinic-pin',
          html: markerHtml,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
          popupAnchor: [0, -14],
        });

        const marker = L.marker([c.latitude, c.longitude], { icon: customIcon });

        const popupContent = `
          <div style="font-family: inherit; width: 220px; padding: 12px; background: #0f172a; color: #f8fafc;">
            ${isSimulated ? `<div style="font-size: 10px; font-weight: 700; color: #38bdf8; text-transform: uppercase; margin-bottom: 4px;">★ Proposed Simulation</div>` : ''}
            <h4 style="font-size: 13px; font-weight: 700; color: #ffffff; margin: 0 0 4px 0; line-height: 1.3;">${c.name}</h4>
            <div style="font-size: 11px; color: ${typeInfo.color}; font-weight: 600; margin-bottom: 8px;">${typeInfo.label}</div>
            
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;">
              📍 ${c.address}
            </div>
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;">
              📞 ${c.phone}
            </div>
            <div style="font-size: 11px; color: #cbd5e1; margin-bottom: 4px; display: flex; justify-content: space-between;">
              <span>Doctors on staff:</span>
              <strong style="color: #ffffff; font-family: monospace;">${c.staffPhysicians}</strong>
            </div>
            <div style="font-size: 11px; color: #cbd5e1; display: flex; justify-content: space-between;">
              <span>Accepts Medicaid:</span>
              <span style="color: ${c.acceptsMedicaid ? '#34d399' : '#f87171'}; font-weight: 600;">${c.acceptsMedicaid ? 'Yes' : 'No'}</span>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        markersGroup.addLayer(marker);
      });
    }
  }, [clinics, filters.showClinicPins, filters.showCatchmentBuffers, filters.selectedTypes]);

  // Zoom control helpers
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleResetBounds = () => {
    const map = mapInstanceRef.current;
    const group = polygonsLayerRef.current;
    if (map && group && group.getLayers().length > 0) {
      map.fitBounds(group.getBounds(), { padding: [30, 30] });
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950">
      {/* Simulation banner indicator */}
      {isSimulatingPlacement && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-sky-900/90 backdrop-blur-md border border-sky-500/40 text-sky-100 px-4 py-2 rounded-xl shadow-xl flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping"></span>
          <span className="text-xs font-semibold">
            Placement Active: Click anywhere on the map to drop proposed clinic location
          </span>
          <button
            onClick={onOpenSimulation}
            className="text-[11px] font-bold text-sky-300 underline hover:text-white ml-2"
          >
            Open Form
          </button>
        </div>
      )}

      {/* Main Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Map Zoom & Extent Controls */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="w-9 h-9 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 backdrop-blur flex items-center justify-center shadow-lg transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="w-9 h-9 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 backdrop-blur flex items-center justify-center shadow-lg transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetBounds}
          title="Reset View Bounds"
          className="w-9 h-9 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 backdrop-blur flex items-center justify-center shadow-lg transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
