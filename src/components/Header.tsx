import React from 'react';
import { MapPin, Table2, BarChart3, Code2, Plus, Download } from 'lucide-react';

interface HeaderProps {
  activeView: 'map' | 'rankings' | 'analytics' | 'backend';
  setActiveView: (view: 'map' | 'rankings' | 'analytics' | 'backend') => void;
  onOpenSimulation: () => void;
  onExportCSV: () => void;
  simulatedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  onOpenSimulation,
  onExportCSV,
  simulatedCount,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-900 border-b border-slate-800 shrink-0 z-30">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
          <MapPin className="w-4 h-4" />
        </div>
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); setActiveView('map'); }}
          className="text-base font-bold tracking-tight text-white whitespace-nowrap"
        >
          Clinic Density Atlas
        </a>
      </div>

      {/* Zone 2: Clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveView('map')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeView === 'map' ? 'text-sky-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Interactive Map</span>
        </button>

        <button
          onClick={() => setActiveView('rankings')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeView === 'rankings' ? 'text-sky-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Table2 className="w-3.5 h-3.5" />
          <span>District Rankings</span>
        </button>

        <button
          onClick={() => setActiveView('analytics')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeView === 'analytics' ? 'text-sky-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Equity Analytics</span>
        </button>

        <button
          onClick={() => setActiveView('backend')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeView === 'backend' ? 'text-sky-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Backend API Spec</span>
        </button>
      </nav>

      {/* Zone 3: 1 primary action with secondary quick export */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onExportCSV}
          title="Download District Density CSV"
          className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700/80 transition-colors whitespace-nowrap flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>

        <button
          onClick={onOpenSimulation}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-sm shadow-sky-600/30"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Propose Clinic</span>
          {simulatedCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-sky-950 text-sky-200 rounded font-mono">
              +{simulatedCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
