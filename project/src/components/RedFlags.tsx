import { AlertOctagon, Cable, Clock, ShieldAlert, TrendingDown, Route } from 'lucide-react';
import type { Fault, MaintenanceProfile, Technician } from '@/types';
import type { Cluster } from '@/lib/geoai';

interface Props { faults: Fault[]; technicians: Technician[]; clusters: Cluster[]; profiles?: MaintenanceProfile[]; onSelect?: (id: string) => void; }
export default function RedFlags({ faults, technicians, clusters, profiles = [], onSelect }: Props) {
  const critical = faults.find((f) => f.priority === 'Critical' && f.status === 'Reported');
  const highRisk = profiles.find((p) => p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL');
  const delayed = technicians.find((t) => !t.available && (t.status === 'En route' || t.status === 'EN ROUTE'));
  const cluster = clusters.find((c) => c.faultIds.length >= 3) || clusters[0];
  const flags = [
    critical && { level: 'critical', title: 'Network Critical', message: `${critical.assetId} offline — recovery takes priority over route efficiency.`, icon: AlertOctagon, action: () => onSelect?.(critical.id), actionLabel: 'View incident' },
    highRisk && { level: 'warning', title: 'Maintenance Risk', message: `${highRisk.siteId} has ${highRisk.riskLevel.toLowerCase()} preventive maintenance risk. Service within ${highRisk.recommendedWindowDays} days.`, icon: ShieldAlert, action: () => onSelect?.(faults.find((f) => f.assetId === highRisk.siteId)?.id || ''), actionLabel: 'View analysis' },
    delayed && { level: 'warning', title: 'SLA Risk', message: `${delayed.name} is delayed while handling an assignment.`, icon: Clock, action: undefined, actionLabel: undefined },
    { level: 'warning', title: 'Road Network', message: 'Congestion detected on the route to the selected site. Alternative route available.', icon: Route, action: undefined, actionLabel: 'View route' },
    cluster && { level: 'success', title: 'Optimization Opportunity', message: `${cluster.faultIds.length} nearby maintenance jobs can be combined into one trip.`, icon: TrendingDown, action: undefined, actionLabel: 'Optimize' },
    !critical && !highRisk && !cluster && { level: 'success', title: 'Operations Nominal', message: 'No active red flags detected in the simulated operating area.', icon: Cable, action: undefined, actionLabel: undefined },
  ].filter(Boolean) as { level: string; title: string; message: string; icon: typeof AlertOctagon; action?: () => void; actionLabel?: string }[];
  const styles: Record<string, { color: string; bg: string; border: string }> = { critical: { color: '#dc2626', bg: 'rgba(220,38,38,0.08)', border: 'rgba(220,38,38,0.25)' }, warning: { color: '#ea580c', bg: 'rgba(234,88,12,0.08)', border: 'rgba(234,88,12,0.25)' }, success: { color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)' } };
  return <div className="card"><div className="flex items-center gap-2 px-5 pt-4 pb-3"><AlertOctagon size={16} className="text-error-500" /><div><h3 className="text-sm font-semibold">Current Red Flags</h3><p className="text-xs muted-text">Operational alerts · Prototype Data</p></div></div><div className="px-5 pb-4 space-y-2">{flags.map((f, i) => { const s = styles[f.level]; const Icon = f.icon; return <div key={`${f.title}-${i}`} className="flex items-start gap-3 rounded-lg p-3" style={{ background: s.bg, border: `1px solid ${s.border}` }}><Icon size={16} className="shrink-0 mt-0.5" style={{ color: s.color }} /><div className="min-w-0 flex-1"><p className="text-sm font-semibold" style={{ color: s.color }}>{f.title}</p><p className="text-xs soft-text mt-0.5">{f.message}</p>{f.action && <button onClick={f.action} className="text-[11px] font-medium mt-2" style={{ color: s.color }}>{f.actionLabel} →</button>}</div></div>; })}</div></div>;
}
