import { LayoutDashboard, Map, AlertTriangle, Users, Navigation, BarChart3, Settings, Radio } from 'lucide-react';
import type { ViewId } from '@/types';

const NAV: { id: ViewId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'map', label: 'Operations Map', icon: Map },
  { id: 'faults', label: 'Active Faults', icon: AlertTriangle },
  { id: 'technicians', label: 'Technicians', icon: Users },
  { id: 'dispatch', label: 'Dispatch Center', icon: Navigation },
  { id: 'comparison', label: 'Performance Comparison', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ active, onNavigate, dark }: { active: ViewId; onNavigate: (v: ViewId) => void; dark: boolean }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 h-full glass border-r" style={{ borderColor: 'var(--surface-border)' }}>
        <div className="flex items-center gap-2.5 px-5 h-14 border-b" style={{ borderColor: 'var(--surface-border)' }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)' }}>
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">GeoRouteAI</p>
            <p className="text-[10px] muted-text uppercase tracking-wider">Dispatch DSS</p>
          </div>
        </div>
        <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
          {NAV.map((item) => {
            const Icon = item.icon;
            const on = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border overflow-hidden ${
                  on
                    ? 'border-primary-600/20'
                    : 'border-transparent hover:border-[var(--surface-border)]'
                }`}
                style={on ? { background: 'rgba(37,99,235,0.1)', color: '#2563eb' } : { color: 'var(--text-soft)' }}
              >
                <Icon size={18} className="shrink-0" />
                <span className="truncate whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="px-5 py-3 border-t" style={{ borderColor: 'var(--surface-border)' }}>
          <p className="text-[10px] muted-text leading-relaxed">
            Prototype Data · Malaysia AOI<br />For demonstration purposes
          </p>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-[500] glass border-t flex justify-around px-2 py-1.5" style={{ borderColor: 'var(--surface-border)' }}>
        {NAV.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const on = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-medium"
              style={{ color: on ? '#2563eb' : 'var(--text-muted)' }}
            >
              <Icon size={18} />
              <span className="max-w-[60px] truncate">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
