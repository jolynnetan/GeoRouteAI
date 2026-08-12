import { Activity, CalendarClock, CheckCircle2, CircleAlert, Gauge, ShieldAlert, Sparkles } from 'lucide-react';
import type { MaintenanceProfile } from '@/types';

const RISK_STYLES = {
  LOW: { color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  MEDIUM: { color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
  HIGH: { color: '#ea580c', bg: 'rgba(234,88,12,0.1)' },
  CRITICAL: { color: '#dc2626', bg: 'rgba(220,38,38,0.1)' },
};

export default function MaintenanceRiskPanel({ profile }: { profile: MaintenanceProfile | null }) {
  if (!profile) return <div className="card p-5 text-sm muted-text">Select a site to view the prototype risk analysis.</div>;
  const style = RISK_STYLES[profile.riskLevel];
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-2"><ShieldAlert size={17} className="text-primary-500" /><div><h3 className="text-sm font-semibold">Preventive Maintenance Risk</h3><p className="text-xs muted-text">Prototype GeoAI Risk Model · Simulated</p></div></div>
        <span className="text-[11px] px-2 py-1 rounded-full font-bold" style={{ color: style.color, background: style.bg }}>{profile.riskLevel} RISK</span>
      </div>
      <div className="px-5 pb-5 space-y-4">
        <div className="flex items-center gap-4 rounded-lg p-3" style={{ background: 'var(--bg-soft)', border: '1px solid var(--surface-border)' }}>
          <div className="relative w-16 h-16 shrink-0"><svg className="w-16 h-16 -rotate-90"><circle cx="32" cy="32" r="27" fill="none" stroke="var(--surface-border)" strokeWidth="6" /><circle cx="32" cy="32" r="27" fill="none" stroke={style.color} strokeWidth="6" strokeDasharray={`${profile.siteHealth * 1.7} 170`} strokeLinecap="round" /></svg><span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{profile.siteHealth}</span></div>
          <div><p className="text-xs muted-text">Site Health</p><p className="text-sm font-semibold mt-0.5">{profile.siteId}</p><p className="text-xs mt-1" style={{ color: style.color }}>Maintenance risk: {profile.riskLevel}</p></div>
        </div>
        <div className="flex items-center gap-2 rounded-lg p-3" style={{ color: '#2563eb', background: 'rgba(37,99,235,0.07)', border: '1px solid rgba(37,99,235,0.2)' }}><CalendarClock size={16} /><div><p className="text-xs font-semibold">AI Recommendation</p><p className="text-sm font-medium mt-0.5">Schedule preventive inspection within {profile.recommendedWindowDays} days.</p></div></div>
        <div><p className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Sparkles size={13} className="text-primary-500" /> Why {profile.siteId}?</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{profile.riskFactors.map((factor) => <div key={factor} className="flex items-center gap-2 text-xs soft-text"><CheckCircle2 size={13} className="text-success-500 shrink-0" />{factor}</div>)}</div></div>
        <div className="grid grid-cols-3 gap-2 text-center"><Stat icon={Activity} label="Fault freq." value={`${profile.faultFrequency}/mo`} /><Stat icon={Gauge} label="Utilization" value={`${profile.networkUtilization}%`} /><Stat icon={CircleAlert} label="Signal loss" value={`${profile.signalDegradation}%`} /></div>
        <p className="text-[10px] muted-text">All health, risk, and maintenance values are simulated prototype estimates, not production measurements.</p>
      </div>
    </div>
  );
}
function Stat({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: string }) { return <div className="rounded-lg p-2" style={{ background: 'var(--bg-soft)', border: '1px solid var(--surface-border)' }}><Icon size={13} className="mx-auto text-primary-500" /><p className="text-[10px] muted-text mt-1">{label}</p><p className="text-xs font-semibold mt-0.5">{value}</p></div>; }
