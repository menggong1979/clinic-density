import React from 'react';
import { District, Clinic, FilterState } from '../../types/clinic';
import { AlertCircle, TrendingUp, Users, HeartPulse, Scale, ShieldAlert } from 'lucide-react';

interface AnalyticsViewProps {
  districts: District[];
  clinics: Clinic[];
  filters: FilterState;
  onSelectDistrict: (district: District) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  districts,
  clinics,
  filters,
  onSelectDistrict,
}) => {
  // Aggregate Calculations
  const totalPopulation = districts.reduce((acc, d) => acc + d.population, 0);
  const totalClinics = clinics.length;
  const regionalAverageDensity = totalPopulation > 0 ? (totalClinics / totalPopulation) * 10000 : 0;

  // District densities
  const districtStats = districts.map(d => {
    const count = clinics.filter(c => c.districtId === d.id).length;
    const density = d.population > 0 ? (count / d.population) * 10000 : 0;
    const isDesert = density < filters.desertThreshold;
    return {
      district: d,
      count,
      density,
      isDesert,
      uninsuredRate: d.demographics.uninsuredRate,
      lowIncomeRate: d.demographics.lowIncomeRate,
    };
  });

  // Sort by density
  const sortedByDensity = [...districtStats].sort((a, b) => b.density - a.density);
  const highest = sortedByDensity[0];
  const lowest = sortedByDensity[sortedByDensity.length - 1];
  const disparityRatio = lowest && lowest.density > 0 ? (highest.density / lowest.density).toFixed(1) : 'N/A';

  const desertDistricts = districtStats.filter(s => s.isDesert);
  const desertPopulation = desertDistricts.reduce((acc, s) => acc + s.district.population, 0);
  const desertPopPercent = totalPopulation > 0 ? ((desertPopulation / totalPopulation) * 100).toFixed(1) : '0';

  return (
    <div className="flex-1 bg-slate-950 p-6 overflow-y-auto space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Healthcare Equity & Density Analytics
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Quantitative assessment of geographic clinic distribution disparities and vulnerable population exposure
        </p>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Regional Average Density</span>
            <HeartPulse className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {regionalAverageDensity.toFixed(2)}
            <span className="text-xs font-normal text-slate-400 ml-1.5 font-sans">/ 10k pop</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Target benchmark: {filters.desertThreshold.toFixed(1)} / 10k
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Geographic Disparity Ratio</span>
            <Scale className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
            {disparityRatio}x
            <span className="text-xs font-normal text-slate-400 ml-1.5 font-sans">gap</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Highest ({highest?.district.name}: {highest?.density.toFixed(1)}) vs Lowest ({lowest?.district.name}: {lowest?.density.toFixed(1)})
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Pop in Healthcare Deserts</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-400 tabular-nums">
            {desertPopulation.toLocaleString()}
            <span className="text-xs font-normal text-slate-400 ml-1.5 font-sans">({desertPopPercent}%)</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Across {desertDistricts.length} underserved districts
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Total Active Facilities</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {totalClinics}
            <span className="text-xs font-normal text-slate-400 ml-1.5 font-sans">verified</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Serving {totalPopulation.toLocaleString()} total residents
          </div>
        </div>
      </div>

      {/* Density Distribution Bar Chart */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-white">
              Clinic Density by District (Clinics per 10,000 Population)
            </h2>
            <p className="text-xs text-slate-400">
              Ranked from lowest (healthcare desert) to highest density, with benchmark threshold line
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-red-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              Desert (&lt;{filters.desertThreshold.toFixed(1)})
            </span>
            <span className="flex items-center gap-1.5 text-sky-400">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
              Adequate (≥{filters.desertThreshold.toFixed(1)})
            </span>
          </div>
        </div>

        {/* Custom SVG / HTML Bar Chart */}
        <div className="space-y-2 pt-2">
          {[...districtStats].sort((a, b) => a.density - b.density).map(stat => {
            const maxVal = 6.5;
            const barWidthPercent = Math.min(100, (stat.density / maxVal) * 100);
            const targetLinePercent = Math.min(100, (filters.desertThreshold / maxVal) * 100);

            return (
              <div
                key={stat.district.id}
                onClick={() => onSelectDistrict(stat.district)}
                className="group cursor-pointer p-2 rounded-lg hover:bg-slate-800/60 transition-colors"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400 text-[10px] w-8">{stat.district.code}</span>
                    <span className="font-medium text-slate-200 group-hover:text-sky-300 transition-colors">
                      {stat.district.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
                    <span className="text-slate-400">{stat.district.population.toLocaleString()} pop</span>
                    <span className="text-slate-400">{stat.count} clinics</span>
                    <span className={`font-bold w-12 text-right ${stat.isDesert ? 'text-red-400' : 'text-sky-400'}`}>
                      {stat.density.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="relative w-full h-4 bg-slate-950 rounded overflow-hidden">
                  {/* Target benchmark dashed indicator */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-amber-400/80 z-10"
                    style={{ left: `${targetLinePercent}%` }}
                    title={`Target: ${filters.desertThreshold.toFixed(1)} / 10k`}
                  />

                  {/* Density Bar */}
                  <div
                    className={`h-full rounded transition-all ${
                      stat.isDesert ? 'bg-red-500/80 group-hover:bg-red-400' : 'bg-sky-500/80 group-hover:bg-sky-400'
                    }`}
                    style={{ width: `${barWidthPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Disparity & Equity Analysis Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vulnerability Correlation Box */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Singapore Health Equity & Demographic Insights</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Mature HDB towns (e.g. Bukit Merah, Ang Mo Kio, Bedok) exhibit high proportions of senior citizens (over 22–26%), driving elevated chronic disease management demands. Rapidly expanding family towns like Punggol and Sengkang exhibit high child dependency ratios, necessitating dedicated paediatric and maternal primary care.
          </p>
          <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800/80 space-y-1.5 text-xs">
            <div className="font-semibold text-sky-400 text-[11px] uppercase tracking-wider">
              Priority Planning Areas for Primary Care Expansion:
            </div>
            {desertDistricts.map(d => (
              <div key={d.district.id} className="flex justify-between items-center text-slate-300">
                <span>{d.district.name.replace(' Planning Area', '')} ({d.district.code})</span>
                <span className="font-mono text-red-400 font-semibold">{d.density.toFixed(2)} clinics/10k</span>
              </div>
            ))}
          </div>
        </div>

        {/* Planning Recommendations */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Healthier SG Primary Care Deployment Targets</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Under Singapore's national <span className="font-mono text-white font-semibold">{filters.desertThreshold.toFixed(1)} / 10k</span> accessibility standard, an additional{' '}
            <span className="font-mono text-amber-400 font-bold">
              {districtStats.reduce((acc, s) => {
                const target = Math.ceil((filters.desertThreshold * s.district.population) / 10000);
                return acc + Math.max(0, target - s.count);
              }, 0)}
            </span>{' '}
            primary care facilities are recommended across the {desertDistricts.length} underserved planning areas.
          </p>
          <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800/80 space-y-2 text-xs">
            <div className="text-[11px] font-semibold text-slate-400">
              Recommended Singapore Facility Mix:
            </div>
            <div className="flex items-center justify-between text-slate-300 text-[11px]">
              <span>CHAS GP Family Practice / Healthier SG:</span>
              <span className="font-mono text-emerald-400 font-bold">50% Priority</span>
            </div>
            <div className="flex items-center justify-between text-slate-300 text-[11px]">
              <span>MOH Public Polyclinics / Community Health Posts:</span>
              <span className="font-mono text-amber-400 font-bold">30% Priority</span>
            </div>
            <div className="flex items-center justify-between text-slate-300 text-[11px]">
              <span>Paediatric & Women's Maternal Care:</span>
              <span className="font-mono text-sky-400 font-bold">20% Priority</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
