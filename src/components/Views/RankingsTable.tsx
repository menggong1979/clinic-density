import React, { useState } from 'react';
import { District, Clinic, FilterState } from '../../types/clinic';
import { ArrowUpDown, AlertTriangle, CheckCircle, Download, ExternalLink, Search } from 'lucide-react';

interface RankingsTableProps {
  districts: District[];
  clinics: Clinic[];
  filters: FilterState;
  onSelectDistrict: (district: District) => void;
  onExportCSV: () => void;
}

type SortField = 'density10k' | 'population' | 'clinicsCount' | 'popPerClinic' | 'uninsuredRate' | 'deficit';

export const RankingsTable: React.FC<RankingsTableProps> = ({
  districts,
  clinics,
  filters,
  onSelectDistrict,
  onExportCSV,
}) => {
  const [sortField, setSortField] = useState<SortField>('density10k');
  const [sortAsc, setSortAsc] = useState<boolean>(true); // Ascending puts lowest density (deserts) first!
  const [filterDesertOnly, setFilterDesertOnly] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');

  // Calculate stats for all districts
  const rows = districts.map(d => {
    const districtClinics = clinics.filter(c => c.districtId === d.id);
    const count = districtClinics.length;
    const density10k = d.population > 0 ? (count / d.population) * 10000 : 0;
    const density100k = d.population > 0 ? (count / d.population) * 100000 : 0;
    const popPerClinic = count > 0 ? Math.round(d.population / count) : d.population;
    const isDesert = density10k < filters.desertThreshold;
    const targetCount = Math.ceil((filters.desertThreshold * d.population) / 10000);
    const deficit = Math.max(0, targetCount - count);

    return {
      district: d,
      count,
      density10k,
      density100k,
      popPerClinic,
      isDesert,
      deficit,
      uninsuredRate: d.demographics.uninsuredRate,
      lowIncomeRate: d.demographics.lowIncomeRate,
    };
  });

  // Filter
  const filteredRows = rows.filter(r => {
    if (filterDesertOnly && !r.isDesert) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return r.district.name.toLowerCase().includes(q) || r.district.code.toLowerCase().includes(q);
    }
    return true;
  });

  // Sort
  const sortedRows = [...filteredRows].sort((a, b) => {
    let diff = 0;
    switch (sortField) {
      case 'density10k':
        diff = a.density10k - b.density10k;
        break;
      case 'population':
        diff = a.district.population - b.district.population;
        break;
      case 'clinicsCount':
        diff = a.count - b.count;
        break;
      case 'popPerClinic':
        diff = a.popPerClinic - b.popPerClinic;
        break;
      case 'uninsuredRate':
        diff = a.uninsuredRate - b.uninsuredRate;
        break;
      case 'deficit':
        diff = a.deficit - b.deficit;
        break;
    }
    return sortAsc ? diff : -diff;
  });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === 'density10k'); // Default to ascending for density (worst first)
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 p-6 overflow-hidden">
      {/* Top Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-800 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            District Healthcare Density Rankings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Comparative analysis of clinic distribution, population coverage ratios, and allocation deficits
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter district by name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-500 text-xs focus:outline-none focus:border-sky-500"
            />
          </div>

          <button
            onClick={() => setFilterDesertOnly(!filterDesertOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap border ${
              filterDesertOnly
                ? 'bg-red-950/60 text-red-200 border-red-800'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            {filterDesertOnly ? 'Showing Deserts Only' : 'Show Deserts Only'}
          </button>

          <button
            onClick={onExportCSV}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 border border-slate-700 hover:bg-slate-700 flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 mt-4 overflow-auto border border-slate-800 rounded-xl bg-slate-900/80 shadow-xl">
        <table className="w-full text-left text-xs text-slate-300 border-collapse">
          <thead className="bg-slate-950/90 text-slate-400 text-[11px] uppercase tracking-wider sticky top-0 z-10 border-b border-slate-800">
            <tr>
              <th className="py-3 px-4 font-semibold w-12 text-center">Rank</th>
              <th className="py-3 px-4 font-semibold">District</th>
              <th
                onClick={() => toggleSort('population')}
                className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Population</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('clinicsCount')}
                className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Clinics</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('density10k')}
                className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Clinics / 10k Pop</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('popPerClinic')}
                className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Pop / Clinic</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('uninsuredRate')}
                className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Uninsured %</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('deficit')}
                className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Deficit to Target</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 font-semibold text-center">Status</th>
              <th className="py-3 px-4 font-semibold text-center w-20">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {sortedRows.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-500">
                  No districts match your filter criteria.
                </td>
              </tr>
            ) : (
              sortedRows.map((row, index) => (
                <tr
                  key={row.district.id}
                  className="hover:bg-slate-800/50 transition-colors group"
                >
                  <td className="py-3 px-4 text-center font-mono font-medium text-slate-500 tabular-nums">
                    #{index + 1}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white group-hover:text-sky-300 transition-colors">
                      {row.district.name}
                    </div>
                    <div className="font-mono text-[10px] text-slate-500">
                      {row.district.code} · {row.district.areaSqKm} km²
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-200">
                    {row.district.population.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-200">
                    {row.count}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-bold">
                    <span
                      className={
                        row.isDesert
                          ? 'text-red-400'
                          : row.density10k >= 3.5
                          ? 'text-emerald-400'
                          : 'text-sky-400'
                      }
                    >
                      {row.density10k.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300">
                    {row.popPerClinic.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300">
                    {row.uninsuredRate}%
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    {row.deficit > 0 ? (
                      <span className="text-amber-400 font-semibold">+{row.deficit} clinics</span>
                    ) : (
                      <span className="text-slate-500">Met</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.isDesert ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-red-950/60 text-red-300 border border-red-800/80">
                        <AlertTriangle className="w-3 h-3 text-red-400" />
                        <span>Desert</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/80">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        <span>Adequate</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onSelectDistrict(row.district)}
                      className="px-2 py-1 bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white rounded transition-colors text-[11px] flex items-center justify-center gap-1 mx-auto"
                      title="View district on map and inspector"
                    >
                      <span>Map</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
