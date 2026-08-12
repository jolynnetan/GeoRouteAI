import { Sun, Moon, Map as MapIcon, Layers, RotateCcw, Check, Info } from 'lucide-react';
import type { Settings, MapLayers, MapStyle } from '@/types';

interface Props {
  settings: Settings;
  setSettings: (s: Settings) => void;
  onReset: () => void;
  onShowDataInfo?: () => void;
}

const LAYER_LABELS: { key: keyof MapLayers; label: string }[] = [
  { key: 'sites', label: 'Telecom Sites' },
  { key: 'faults', label: 'Faults' },
  { key: 'technicians', label: 'Technicians' },
  { key: 'roads', label: 'Road Network' },
  { key: 'route', label: 'Optimized Route' },
  { key: 'clusters', label: 'Cluster Boundaries' },
  { key: 'traffic', label: 'Traffic Conditions' },
  { key: 'closures', label: 'Road Closures' },
  { key: 'alternativeRoutes', label: 'Alternative Routes' },
];

export default function SettingsView({ settings, setSettings, onReset, onShowDataInfo }: Props) {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Appearance */}
      <div className="card">
        <div className="flex items-center gap-2 px-5 pt-4 pb-3">
          <Sun size={16} className="text-primary-500" />
          <div>
            <h3 className="text-sm font-semibold">Appearance</h3>
            <p className="text-xs muted-text">Theme and map preferences</p>
          </div>
        </div>
        <div className="px-5 pb-5 space-y-4">
          <div>
            <p className="text-xs font-medium soft-text mb-2">Theme</p>
            <div className="grid grid-cols-2 gap-2">
              {([false, true] as const).map((dark) => (
                <button
                  key={String(dark)}
                  onClick={() => setSettings({ ...settings, dark })}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-lg border transition-all"
                  style={{
                    borderColor: settings.dark === dark ? '#2563eb' : 'var(--surface-border)',
                    background: settings.dark === dark ? 'rgba(37,99,235,0.05)' : 'transparent',
                  }}
                >
                  {dark ? <Moon size={16} className="text-primary-500" /> : <Sun size={16} className="text-primary-500" />}
                  <span className="text-sm font-medium">{dark ? 'Dark Mode' : 'Light Mode'}</span>
                  {settings.dark === dark && <Check size={14} className="text-primary-600 ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium soft-text mb-2">Map Style</p>
            <div className="grid grid-cols-3 gap-2">
              {(['light', 'dark', 'satellite'] as MapStyle[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSettings({ ...settings, mapStyle: s })}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all text-sm capitalize"
                  style={{
                    borderColor: settings.mapStyle === s ? '#2563eb' : 'var(--surface-border)',
                    color: settings.mapStyle === s ? '#2563eb' : 'var(--text-soft)',
                    background: settings.mapStyle === s ? 'rgba(37,99,235,0.05)' : 'transparent',
                  }}
                >
                  <MapIcon size={14} /> {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Layers */}
      <div className="card">
        <div className="flex items-center gap-2 px-5 pt-4 pb-3">
          <Layers size={16} className="text-primary-500" />
          <div>
            <h3 className="text-sm font-semibold">Map Layers</h3>
            <p className="text-xs muted-text">Toggle which layers appear on the GIS map</p>
          </div>
        </div>
        <div className="px-5 pb-5 space-y-2">
          {LAYER_LABELS.map((l) => {
            const on = settings.layers[l.key];
            return (
              <button
                key={l.key}
                onClick={() => setSettings({ ...settings, layers: { ...settings.layers, [l.key]: !on } })}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all"
                style={{
                  borderColor: on ? 'rgba(16,185,129,0.3)' : 'var(--surface-border)',
                  background: on ? 'rgba(16,185,129,0.05)' : 'var(--bg-soft)',
                }}
              >
                <span className="text-sm font-medium">{l.label}</span>
                <span className="w-10 h-5 rounded-full relative transition-colors" style={{ background: on ? '#10b981' : 'var(--surface-border)' }}>
                  <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: on ? '22px' : '2px' }} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset */}
      <div className="card">
        <div className="flex items-center gap-2 px-5 pt-4 pb-3">
          <RotateCcw size={16} className="text-primary-500" />
          <div>
            <h3 className="text-sm font-semibold">Demo Data</h3>
            <p className="text-xs muted-text">Reset the prototype to its initial state</p>
          </div>
        </div>
        <div className="px-5 pb-5">
          <p className="text-xs muted-text mb-3">This restores all telecom assets, faults, and technicians to their original simulated values. All dispatches will be cleared.</p>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: 'var(--bg-soft)', border: '1px solid var(--surface-border)', color: 'var(--text-soft)' }}
          >
            <RotateCcw size={15} /> Reset Demo Data
          </button>
        </div>
      </div>

      {/* Data & GeoAI Info */}
      <div className="card">
        <div className="flex items-center gap-2 px-5 pt-4 pb-3">
          <Info size={16} className="text-primary-500" />
          <div>
            <h3 className="text-sm font-semibold">Data & GeoAI Information</h3>
            <p className="text-xs muted-text">Prototype data sources and GeoAI methods</p>
          </div>
        </div>
        <div className="px-5 pb-5">
          <p className="text-xs muted-text mb-3">View the full transparency report for data sources, GeoAI methods, and prototype honesty disclosures.</p>
          <button
            onClick={onShowDataInfo}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', color: '#2563eb' }}
          >
            <Info size={15} /> View Data & GeoAI Info
          </button>
        </div>
      </div>

      <p className="text-center text-[11px] muted-text py-2">GeoRouteAI · Prototype Data · For demonstration purposes only</p>
    </div>
  );
}
