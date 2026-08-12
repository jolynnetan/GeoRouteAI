import { AlertTriangle, CheckCircle2, Route, Zap, ShieldCheck, RadioTower } from 'lucide-react';
import type { TrafficSegment } from '@/types';

interface Props {
  traffic: TrafficSegment[];
  detected: boolean;
  onDetect: () => void;
  currentDistanceKm: number;
  currentEta: number;
  alternativeDistanceKm: number;
  alternativeEta: number;
  slaOnTrack: boolean;
  applied: boolean;
  onApply: () => void;
}

export default function TrafficUpdatePanel({ traffic, detected, onDetect, currentDistanceKm, currentEta, alternativeDistanceKm, alternativeEta, slaOnTrack, applied, onApply }: Props) {
  const congested = traffic.filter((s) => s.state !== 'NORMAL');
  const savedMin = Math.max(0, currentEta - alternativeEta);
  const faster = alternativeEta < currentEta;

  if (!detected) {
    return (
      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 px-5 pt-4 pb-3">
          <Route size={16} className="text-primary-500" />
          <div>
            <h3 className="text-sm font-semibold">Dynamic Route Intelligence</h3>
            <p className="text-xs muted-text">Technician is en route · Road network monitoring idle</p>
          </div>
        </div>
        <div className="px-5 pb-5 space-y-3">
          <p className="text-xs soft-text">Trigger a simulated road-condition change to test GeoRouteAI's alternative-route recommendation for this trip.</p>
          <button onClick={onDetect} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white" style={{ background: '#d97706' }}>
            <RadioTower size={15} /> Simulate Traffic Update
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <Route size={16} className="text-primary-500" />
          <div>
            <h3 className="text-sm font-semibold">Dynamic Route Intelligence</h3>
            <p className="text-xs muted-text">Real road network geometry · Simulated traffic conditions</p>
          </div>
        </div>
        <span className="text-[10px] px-2 py-1 rounded-full" style={{ color: '#d97706', background: 'rgba(245,158,11,0.12)' }}>PROTOTYPE</span>
      </div>
      <div className="px-5 pb-5 space-y-3">
        {!applied && (
          <div className="flex items-center gap-2 rounded-lg p-2.5" style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)' }}>
            <AlertTriangle size={14} style={{ color: '#dc2626' }} />
            <div>
              <p className="text-xs font-semibold" style={{ color: '#dc2626' }}>⚠️ ROAD NETWORK ALERT</p>
              <p className="text-[11px] muted-text">Current route affected by congestion.</p>
            </div>
          </div>
        )}

        {congested.slice(0, 2).map((segment) => (
          <div key={segment.id} className="flex items-center gap-2 rounded-lg p-2.5" style={{ background: segment.state === 'CLOSED' ? 'rgba(220,38,38,0.08)' : 'rgba(245,158,11,0.08)', border: `1px solid ${segment.state === 'CLOSED' ? 'rgba(220,38,38,0.25)' : 'rgba(245,158,11,0.25)'}` }}>
            <AlertTriangle size={14} style={{ color: segment.state === 'CLOSED' ? '#dc2626' : '#d97706' }} />
            <div className="flex-1">
              <p className="text-xs font-semibold">{segment.label}</p>
              <p className="text-[11px] muted-text">{segment.state === 'CLOSED' ? 'Road closure detected' : `${segment.state.toLowerCase()} · ${segment.multiplier}× travel factor`}</p>
            </div>
          </div>
        ))}

        <div className="grid grid-cols-2 gap-2">
          <RouteCard label="Current Route" distanceKm={currentDistanceKm} eta={`${currentEta} min`} color="#dc2626" active={!applied} />
          <RouteCard label="Alternative Route" distanceKm={alternativeDistanceKm} eta={`${alternativeEta} min`} color="#7c3aed" active={applied} />
        </div>

        {!applied && faster && (
          <div>
            <p className="text-[11px] font-semibold muted-text mb-1">Why alternative route?</p>
            <div className="space-y-1">
              <ReasonLine text="Lower congestion" />
              <ReasonLine text="Estimated travel time improvement" />
              {slaOnTrack && <ReasonLine text="Technician remains within SLA" icon={ShieldCheck} />}
            </div>
            <div className="flex items-center gap-2 text-xs text-success-600 mt-2">
              <Zap size={13} /> {savedMin} minute{savedMin === 1 ? '' : 's'} faster than the current route.
            </div>
          </div>
        )}

        {applied ? (
          <div className="rounded-lg p-3 space-y-2" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <p className="text-xs font-semibold flex items-center gap-1.5 text-success-600"><CheckCircle2 size={14} /> ALTERNATIVE ROUTE APPLIED</p>
            <div>
              <p className="text-[11px] font-semibold muted-text mb-1">Why?</p>
              <div className="space-y-1">
                <ReasonLine text="Lower congestion" />
                <ReasonLine text="Estimated travel time reduced" />
                {slaOnTrack && <ReasonLine text="Technician remains within SLA" icon={ShieldCheck} />}
              </div>
            </div>
            <p className="text-[11px] font-medium text-success-600">Impact: {savedMin} min travel time saved</p>
          </div>
        ) : (
          <button onClick={onApply} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white" style={{ background: '#7c3aed' }}>
            <Route size={15} /> Apply Alternative Route
          </button>
        )}
        <p className="text-[10px] muted-text">Distance and ETA are calculated from the actual road-network route geometry and current traffic multipliers, not fixed values.</p>
      </div>
    </div>
  );
}

function RouteCard({ label, distanceKm, eta, color, active }: { label: string; distanceKm: number; eta: string; color: string; active: boolean }) {
  return (
    <div className="rounded-lg p-3" style={{ border: `1px solid ${active ? `${color}55` : 'var(--surface-border)'}`, background: active ? `${color}0d` : 'transparent' }}>
      <div className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color }}>
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />{label}{active && ' · Active'}
      </div>
      <p className="text-lg font-bold mt-1">{eta}</p>
      <p className="text-[11px] muted-text">{distanceKm} km</p>
    </div>
  );
}

function ReasonLine({ text, icon: Icon = CheckCircle2 }: { text: string; icon?: typeof CheckCircle2 }) {
  return <div className="flex items-center gap-2 text-xs soft-text"><Icon size={13} className="text-success-500 shrink-0" />{text}</div>;
}
