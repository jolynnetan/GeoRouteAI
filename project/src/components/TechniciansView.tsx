import { Users, MapPin, Award, Activity } from 'lucide-react';
import type { Technician, TechnicianStatus } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: '#10b981',
  'AWAITING RESPONSE': '#f59e0b',
  ASSIGNED: '#3b82f6',
  'EN ROUTE': '#f59e0b',
  'ARRIVED': '#7c3aed',
  'MAINTENANCE IN PROGRESS': '#ea580c',
  COMPLETED: '#10b981',
  OFFLINE: '#64748b',
};

const LEGEND: { status: TechnicianStatus; color: string }[] = [
  { status: 'AVAILABLE', color: '#10b981' },
  { status: 'AWAITING RESPONSE', color: '#f59e0b' },
  { status: 'ASSIGNED', color: '#3b82f6' },
  { status: 'EN ROUTE', color: '#f59e0b' },
  { status: 'ARRIVED', color: '#7c3aed' },
  { status: 'MAINTENANCE IN PROGRESS', color: '#ea580c' },
  { status: 'COMPLETED', color: '#10b981' },
  { status: 'OFFLINE', color: '#64748b' },
];

export default function TechniciansView({ technicians }: { technicians: Technician[] }) {
  const regions: ('KL' | 'PN' | 'JB')[] = ['KL', 'PN', 'JB'];
  const regionNames: Record<string, string> = { KL: 'Klang Valley', PN: 'Penang', JB: 'Johor' };

  return (
    <div className="space-y-4">
      <div className="card px-5 py-4">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-primary-500" />
          <h2 className="text-sm font-semibold">Field Technicians</h2>
          <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
            {technicians.filter((t) => t.available).length} available
          </span>
          <span className="text-xs muted-text ml-auto">{technicians.length} crews · Prototype Data</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {LEGEND.map((l) => (
            <div key={l.status} className="flex items-center gap-1.5 text-[10px] muted-text">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: l.color }} />
              {l.status}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {regions.map((r) => {
          const techs = technicians.filter((t) => t.region === r);
          const avail = techs.filter((t) => t.available).length;
          const pct = (avail / techs.length) * 100;
          return (
            <div key={r} className="card">
              <div className="flex items-center justify-between px-5 pt-4 pb-3">
                <h3 className="text-sm font-semibold">{regionNames[r]}</h3>
                <span className="text-xs muted-text">{avail}/{techs.length} available</span>
              </div>
              <div className="px-5 pb-2">
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-soft)' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#2563eb,#06b6d4)' }} />
                </div>
              </div>
              <div className="px-3 pb-3 space-y-2">
                {techs.map((t) => {
                  const statusLabel = t.lifecycleStatus || t.status;
                  const c = STATUS_COLORS[statusLabel] || (t.available ? '#10b981' : '#64748b');
                  return (
                    <div key={t.id} className="rounded-lg border p-3" style={{ borderColor: t.available ? 'rgba(16,185,129,0.3)' : 'var(--surface-border)', background: t.available ? 'rgba(16,185,129,0.04)' : 'var(--bg-soft)' }}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: c }}>{t.crew[0]}</div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{t.name}</p>
                            <p className="text-xs muted-text mt-0.5">{t.skills.join(' · ')}</p>
                          </div>
                        </div>
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0" style={{ color: c, background: `${c}1a`, border: `1px solid ${c}40` }}>{statusLabel}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        <div className="flex items-center gap-1 text-[11px] muted-text"><MapPin size={11} /> {t.pos.lat.toFixed(2)},{t.pos.lng.toFixed(2)}</div>
                        <div className="flex items-center gap-1 text-[11px] muted-text"><Activity size={11} /> {t.activeJobs} active</div>
                        <div className="flex items-center gap-1 text-[11px] muted-text"><Award size={11} /> SLA {t.slaScore}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
