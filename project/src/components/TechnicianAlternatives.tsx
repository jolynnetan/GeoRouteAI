import { ArrowRight, CheckCircle2, MapPin, UserRound, X } from 'lucide-react';
import type { Fault, Technician } from '@/types';
import type { Graph, Recommendation } from '@/lib/geoai';
import { recommendForTechnician } from '@/lib/geoai';

interface Props {
  fault: Fault;
  technicians: Technician[];
  graph: Graph;
  rejectedId: string | null;
  rejectedName: string | null;
  rejectionReason: string | null;
  onAssign: (rec: Recommendation) => void;
  onClose?: () => void;
  manual?: boolean;
}
export default function TechnicianAlternatives({ fault, technicians, graph, rejectedId, rejectedName, rejectionReason, onAssign, onClose, manual = false }: Props) {
  const candidates = technicians.filter((t) => t.id !== rejectedId && t.region === fault.region);
  const recommendations = candidates
    .map((t) => recommendForTechnician(graph, fault, t, []))
    .sort((a, b) => (b.confidence - a.confidence) || (a.distanceKm - b.distanceKm));

  return <div className="card overflow-hidden">
    <div className="px-5 pt-4 pb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <UserRound size={16} className="text-primary-500" />
        <div>
          <h3 className="text-sm font-semibold">{manual ? 'Choose Maintainer' : 'Next Best Technician'}</h3>
          <p className="text-xs muted-text">{manual ? 'Dispatcher selects who is assigned · overrides GeoAI suggestion' : 'GeoAI reassigned after rejection · Simulated'}</p>
        </div>
      </div>
      {onClose && <button onClick={onClose} className="p-1 muted-text hover:text-[var(--text)]"><X size={16} /></button>}
    </div>
    {rejectedName && (
      <div className="mx-5 mb-3 rounded-lg p-2.5 flex items-center justify-between" style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)' }}>
        <div><p className="text-xs font-semibold" style={{ color: '#dc2626' }}>{rejectedName} · REJECTED</p>{rejectionReason && <p className="text-[11px] muted-text mt-0.5">Reason: {rejectionReason}</p>}</div>
        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(37,99,235,0.1)', color: '#2563eb' }}>Evaluating alternatives...</span>
      </div>
    )}
    {!recommendations.length && <div className="px-5 pb-4 text-sm muted-text">No other technicians are available in this region.</div>}
    <div className="px-3 pb-4 space-y-2 max-h-80 overflow-y-auto">{recommendations.map((r, index) => <div key={r.technician.id} className="rounded-lg border p-3" style={{ borderColor: index === 0 ? 'rgba(37,99,235,0.35)' : 'var(--surface-border)', background: index === 0 ? 'rgba(37,99,235,0.05)' : 'transparent' }}><div className="flex items-center justify-between gap-3"><div><div className="flex items-center gap-2"><p className="text-sm font-semibold">{r.technician.name}</p>{index === 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full text-primary-600" style={{ background: 'rgba(37,99,235,0.12)' }}>Closest match</span>}{!r.technician.available && <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(148,163,184,0.15)', color: '#64748b' }}>Busy</span>}</div><div className="flex items-center gap-3 mt-1 text-xs muted-text"><span className="flex items-center gap-1"><MapPin size={11} />{r.distanceKm} km</span><span>{r.etaMin} min ETA</span><span>{r.technician.skills.join(' · ')}</span></div></div><button onClick={() => onAssign(r)} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-white shrink-0" style={{ background: '#2563eb' }}>{manual ? 'Assign' : 'Send Request'} <ArrowRight size={13} /></button></div><div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">{r.reasons.slice(0, 4).map((reason) => <span key={reason} className="text-[11px] text-success-600 flex items-center gap-1"><CheckCircle2 size={11} />{reason}</span>)}</div></div>)}</div>
  </div>;
}
