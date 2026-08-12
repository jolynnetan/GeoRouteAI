import { Radio, Signal, Server, AlertTriangle, Users, Route, Hexagon, Map as MapIcon, TrafficCone, Ban, Landmark } from 'lucide-react';
import type { MapLayers } from '@/types';

const LAYER_CONFIG: { key: keyof MapLayers; label: string; icon: typeof Radio }[] = [
  { key: 'sites', label: 'Telecom Sites', icon: Radio },
  { key: 'faults', label: 'Faults', icon: AlertTriangle },
  { key: 'technicians', label: 'Technicians', icon: Users },
  { key: 'roads', label: 'Road Network', icon: Route },
  { key: 'route', label: 'Optimized Route', icon: MapIcon },
  { key: 'clusters', label: 'Clusters', icon: Hexagon },
  { key: 'traffic', label: 'Traffic', icon: TrafficCone },
  { key: 'closures', label: 'Closures', icon: Ban },
  { key: 'alternativeRoutes', label: 'Alt Routes', icon: Route },
  { key: 'boundary', label: 'Region Boundary', icon: Landmark },
];

export default function LayerControls({ layers, setLayers }: { layers: MapLayers; setLayers: (l: MapLayers) => void }) {
  return (
    <div className="glass card p-2 w-44 animate-fade-up">
      <p className="text-[10px] font-semibold muted-text uppercase tracking-wider px-2 py-1">Map Layers</p>
      <div className="space-y-0.5">
        {LAYER_CONFIG.map((l) => {
          const Icon = l.icon;
          const on = layers[l.key];
          return (
            <button
              key={l.key}
              onClick={() => setLayers({ ...layers, [l.key]: !on })}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium transition-colors hover:bg-[var(--bg-soft)]"
              style={{ color: on ? 'var(--text)' : 'var(--text-muted)' }}
            >
              <Icon size={13} style={{ color: on ? '#2563eb' : undefined }} />
              <span className="flex-1 text-left">{l.label}</span>
              <span
                className="w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors"
                style={{ background: on ? '#2563eb' : 'transparent', borderColor: on ? '#2563eb' : 'var(--surface-border)' }}
              >
                {on && (
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { Radio, Signal, Server };
