import React, { useState } from 'react';
import { BACKEND_API_SPECS } from '../../services/api';
import { District, Clinic } from '../../types/clinic';
import { Code2, Server, CheckCircle2, Copy, Check, Upload, Terminal, Play } from 'lucide-react';

interface BackendSpecModalProps {
  onLoadCustomData: (districts: District[], clinics: Clinic[]) => void;
}

export const BackendSpecModal: React.FC<BackendSpecModalProps> = ({ onLoadCustomData }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [apiBaseUrl, setApiBaseUrl] = useState<string>('http://localhost:8000');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');
  const [jsonInput, setJsonInput] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('Pinging ' + apiBaseUrl + '...');
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/districts`, { method: 'GET', signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        setTestStatus('success');
        setTestMessage(`Connected successfully! Server returned status ${res.status}.`);
      } else {
        setTestStatus('error');
        setTestMessage(`Server reachable but responded with status ${res.status}. Check endpoint implementation.`);
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(`Could not connect to ${apiBaseUrl}. Ensure CORS headers (Access-Control-Allow-Origin: *) are enabled and server is running.`);
    }
  };

  const handleApplyCustomData = () => {
    setUploadError('');
    try {
      const parsed = JSON.parse(jsonInput);
      if (!parsed.districts || !Array.isArray(parsed.districts)) {
        throw new Error('JSON must contain a "districts" array.');
      }
      onLoadCustomData(parsed.districts, parsed.clinics || []);
      alert('Custom dataset loaded successfully! Switch to the Interactive Map tab to explore.');
    } catch (err: any) {
      setUploadError(err.message || 'Invalid JSON format.');
    }
  };

  return (
    <div className="flex-1 bg-slate-950 p-6 overflow-y-auto space-y-6 text-slate-300">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Server className="w-3.5 h-3.5" />
          <span>Backend Architecture & Contract</span>
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Backend Integration Guide & API Specification
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
          The frontend is designed with a plug-and-play service layer. When you're ready to integrate your backend (e.g., Express, FastAPI, Django, Go, Spring, or PostgreSQL/PostGIS), implement the REST endpoints below or connect your API base URL.
        </p>
      </div>

      {/* Live Connection Tester Card */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-sky-400" />
          <span>Configure & Test Backend API Endpoint</span>
        </h2>
        <p className="text-xs text-slate-400">
          Set your local dev server or cloud API URL. Set <code className="text-sky-300 bg-slate-950 px-1 py-0.5 rounded font-mono">VITE_API_BASE_URL</code> in <code className="text-sky-300 bg-slate-950 px-1 py-0.5 rounded font-mono">.env</code> or test live connection below:
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
          <div className="flex-1 relative">
            <input
              type="text"
              value={apiBaseUrl}
              onChange={(e) => setApiBaseUrl(e.target.value)}
              placeholder="http://localhost:8000 or https://api.myhealthportal.com"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs font-mono focus:outline-none focus:border-sky-500"
            />
          </div>
          <button
            onClick={handleTestConnection}
            disabled={testStatus === 'testing'}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 shrink-0"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{testStatus === 'testing' ? 'Testing...' : 'Test Connection'}</span>
          </button>
        </div>

        {testStatus !== 'idle' && (
          <div
            className={`p-3 rounded-lg text-xs font-mono ${
              testStatus === 'success'
                ? 'bg-emerald-950/40 border border-emerald-800 text-emerald-300'
                : testStatus === 'testing'
                ? 'bg-slate-950 text-slate-400'
                : 'bg-red-950/40 border border-red-800 text-red-300'
            }`}
          >
            {testMessage}
          </div>
        )}
      </div>

      {/* REST Endpoints Specification */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Code2 className="w-4 h-4 text-sky-400" />
          <span>Required REST API Endpoints</span>
        </h2>

        <div className="space-y-4">
          {BACKEND_API_SPECS.map((spec, index) => (
            <div
              key={index}
              className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm"
            >
              {/* Endpoint Header */}
              <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 font-mono text-xs">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      spec.method === 'GET'
                        ? 'bg-sky-950 text-sky-400 border border-sky-800'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}
                  >
                    {spec.method}
                  </span>
                  <span className="font-semibold text-white">{spec.endpoint}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(spec.responseSample, index)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Schema</span>
                    </>
                  )}
                </button>
              </div>

              {/* Endpoint Details */}
              <div className="p-4 space-y-3 text-xs">
                <p className="text-slate-300">{spec.description}</p>

                {spec.requestBodySchema && (
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 mb-1">
                      Request Body (JSON):
                    </div>
                    <pre className="p-3 bg-slate-950 rounded-lg text-slate-300 font-mono text-[11px] overflow-x-auto border border-slate-800/80">
                      {spec.requestBodySchema}
                    </pre>
                  </div>
                )}

                <div>
                  <div className="text-[11px] font-semibold text-slate-400 mb-1">
                    Response Payload (JSON):
                  </div>
                  <pre className="p-3 bg-slate-950 rounded-lg text-emerald-300/90 font-mono text-[11px] overflow-x-auto border border-slate-800/80">
                    {spec.responseSample}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Direct Custom JSON / GeoJSON Importer */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Upload className="w-4 h-4 text-emerald-400" />
          <span>Direct Dataset Importer (No Backend Required)</span>
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Want to test with your own municipal, county, or state data right now? Paste your JSON dataset below containing <code className="text-sky-300 font-mono">districts</code> and optional <code className="text-sky-300 font-mono">clinics</code>:
        </p>

        <textarea
          rows={6}
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder={`{\n  "districts": [\n    {\n      "id": "my-dist-1",\n      "code": "ZONE-A",\n      "name": "Central District",\n      "population": 50000,\n      "areaSqKm": 12.0,\n      "demographics": { "uninsuredRate": 10, "lowIncomeRate": 15, "seniorsPercent": 12 },\n      "coordinates": [[[ -122.42, 37.77 ], [ -122.40, 37.77 ], [ -122.40, 37.79 ], [ -122.42, 37.79 ], [ -122.42, 37.77 ]]],\n      "clinicsCount": 15\n    }\n  ],\n  "clinics": []\n}`}
          className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:border-sky-500"
        />

        {uploadError && (
          <div className="text-xs text-red-400 font-mono">Error: {uploadError}</div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleApplyCustomData}
            disabled={!jsonInput.trim()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-2"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Load Custom Dataset into Atlas</span>
          </button>
        </div>
      </div>
    </div>
  );
};
