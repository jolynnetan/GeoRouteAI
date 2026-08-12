import { AlertTriangle, Flame, UserCheck, Clock, Route, Gauge } from 'lucide-react';

interface KpiProps {
  activeFaults: number;
  criticalFaults: number;
  availableTechs: number;
  avgResponseMin: number;
  avgTravelKm: number;
  efficiency: number;
}

const items = [
  { key: 'active', label: 'Active Faults', icon: AlertTriangle, color: '#ea580c', bg: 'rgba(234,88,12,0.1)' },
  { key: 'critical', label: 'Critical Faults', icon: Flame, color: '#dc2626', bg: 'rgba(220,38,38,0.1)' },
  { key: 'available', label: 'Available Techs', icon: UserCheck, color: '#2563eb', bg: 'rgba(37,99,235,0.1)' },
  { key: 'response', label: 'Avg Response', icon: Clock, color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
  { key: 'travel', label: 'Avg Travel', icon: Route, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
  { key: 'efficiency', label: 'Dispatch Efficiency', icon: Gauge, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
];

export default function KpiCards({ activeFaults, criticalFaults, availableTechs, avgResponseMin, avgTravelKm, efficiency }: KpiProps) {
  const values: Record<string, string> = {
    active: String(activeFaults),
    critical: String(criticalFaults),
    available: String(availableTechs),
    response: `${avgResponseMin} min`,
    travel: `${avgTravelKm} km`,
    efficiency: `${efficiency}%`,
  };
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <div key={item.key} className="card card-hover p-4 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: item.bg, color: item.color }}>
                <Icon size={18} />
              </div>
            </div>
            <p className="text-xs muted-text uppercase tracking-wide">{item.label}</p>
            <p className="text-2xl font-bold mt-1">{values[item.key]}</p>
          </div>
        );
      })}
    </div>
  );
}
