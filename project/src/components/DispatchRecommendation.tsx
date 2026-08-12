import { Sparkles, Navigation, CheckCircle2, Loader2, MapPin, Clock, Route as RouteIcon, Users, Gauge, ListOrdered, ClipboardCheck } from 'lucide-react';
import type { Fault } from '@/types';
import { PRIORITY_COLOR } from '@/types';
import type { Recommendation } from '@/lib/geoai';

interface Props {
  fault: Fault | null;
  rec: Recommendation | null;
  computing: boolean;
  stage: string;
  onDispatch: () => void;
  dispatched: boolean;
  scheduled: boolean;
  onSchedule: () => void;
  requestSent: boolean;
  routeApplied?: boolean;
  currentRoute?: { distanceKm: number; etaMin: number } | null;
  alternativeRoute?: { distanceKm: number; etaMin: number } | null;
  onChangeTechnician?: () => void;
}

export default function DispatchRecommendation({ fault, rec, computing, stage, onDispatch, dispatched, scheduled, onSchedule, requestSent, routeApplied = false, currentRoute = null, alternativeRoute = null, onChangeTechnician }: Props) {
  if (!fault) {
    return (
      <div className="card flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ background: 'rgba(37,99,235,0.1)' }}>
          <Sparkles className="text-primary-500" size={24} />
        </div>
        <p className="text-sm font-medium">Select a fault to view GeoAI recommendation</p>
        <p className="text-xs muted-text mt-1">Choose a fault from the queue to see the AI dispatch plan.</p>
      </div>
    );
  }

  const c = PRIORITY_COLOR[fault.priority];

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-primary-500" />
          <div>
            <h3 className="text-sm font-semibold">GeoAI Dispatch Recommendation</h3>
            <p className="text-xs muted-text">AI-powered decision support · Prototype Data</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {rec?.manualOverride && (
            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ color: '#7c3aed', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.35)' }}>
              Dispatcher Assigned
            </span>
          )}
          <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ color: c, background: `${c}1a`, border: `1px solid ${c}40` }}>
            {fault.priority}
          </span>
        </div>
      </div>

      {/* Computing stage */}
      {scheduled && computing && (
        <div className="mx-5 mb-3 rounded-lg border p-3" style={{ borderColor: 'var(--surface-border)', background: 'var(--bg-soft)' }}>
          <div className="flex items-center gap-2 text-sm">
            <Loader2 size={15} className="spin-slow text-primary-500" />
            <span className="soft-text">{stage}</span>
          </div>
          <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-soft)' }}>
            <div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg,#2563eb,#06b6d4)', animation: 'scan-line 1.2s ease-in-out infinite' }} />
          </div>
        </div>
      )}

      <div className="px-5 pb-5 space-y-4">
        {/* Fault summary */}
        <div className="rounded-lg p-3" style={{ background: 'var(--bg-soft)', border: '1px solid var(--surface-border)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs muted-text">Fault</p>
              <p className="text-sm font-semibold mt-0.5">{fault.assetId}</p>
            </div>
            <div className="text-right">
              <p className="text-xs muted-text">Type</p>
              <p className="text-sm font-medium soft-text mt-0.5">{fault.type}</p>
            </div>
          </div>
        </div>

        {!scheduled && (
          <div className="rounded-lg p-4 text-center space-y-3" style={{ border: '1px solid rgba(37,99,235,0.25)', background: 'rgba(37,99,235,0.05)' }}>
            <div>
              <p className="text-sm font-semibold">AI Service Recommendation</p>
              <p className="text-xs muted-text mt-1">Risk analysis for {fault.assetId} is complete. Schedule preventive maintenance to get GeoRouteAI's technician recommendation.</p>
            </div>
            <button
              onClick={onSchedule}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white"
              style={{ background: '#2563eb' }}
            >
              <ClipboardCheck size={16} /> Schedule Maintenance
            </button>
          </div>
        )}

        {scheduled && rec && !computing && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Metric icon={Users} label={rec.manualOverride ? 'Assigned Maintainer' : 'Recommended Technician'} value={rec.technician.name} accent="#2563eb" />
              <Metric icon={RouteIcon} label="Travel Distance" value={`${(routeApplied ? alternativeRoute : currentRoute)?.distanceKm ?? rec.distanceKm} km`} accent="#06b6d4" />
              <Metric icon={Clock} label="Estimated Arrival" value={`${(routeApplied ? alternativeRoute : currentRoute)?.etaMin ?? rec.etaMin} min`} accent="#7c3aed" />
              <Metric icon={MapPin} label="Cluster Group" value={rec.clusterSize > 1 ? `${rec.clusterSize} Jobs` : 'Solo'} accent="#10b981" />
            </div>

            {!requestSent && !dispatched && onChangeTechnician && (
              <button
                onClick={onChangeTechnician}
                className="w-full text-xs font-medium py-2 rounded-lg transition-colors"
                style={{ background: 'var(--bg-soft)', border: '1px dashed var(--surface-border)', color: 'var(--text-soft)' }}
              >
                Not this technician? Choose a different maintainer
              </button>
            )}

            {/* Confidence */}
            <div className="rounded-lg p-3" style={{ border: '1px solid var(--surface-border)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium soft-text flex items-center gap-1.5">
                  <Gauge size={13} /> Dispatch Confidence
                </span>
                <span className="text-sm font-bold text-primary-600">{rec.confidence}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-soft)' }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${rec.confidence}%`, background: 'linear-gradient(90deg,#2563eb,#06b6d4)' }} />
              </div>
            </div>

            {/* Why this technician */}
            <div className="rounded-lg p-3" style={{ border: '1px solid var(--surface-border)' }}>
              <p className="text-xs font-semibold mb-2">Why {rec.technician.name}?</p>
              <div className="space-y-1.5">
                {rec.reasons.map((r) => (
                  <div key={r} className="flex items-center gap-2 text-xs soft-text">
                    <CheckCircle2 size={13} className="text-success-500 shrink-0" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Decision priority */}
            <div className="rounded-lg p-3" style={{ border: '1px solid var(--surface-border)', background: 'var(--bg-soft)' }}>
              <p className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                <ListOrdered size={13} className="text-primary-500" /> Decision Priority
              </p>
              <ol className="space-y-1">
                {rec.decisionPriority.map((p, i) => (
                  <li key={p} className="text-xs soft-text flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0" style={{ background: i === 0 ? '#dc2626' : 'var(--surface-border)', color: i === 0 ? '#fff' : 'var(--text-muted)' }}>{i + 1}</span>
                    {p}
                  </li>
                ))}
              </ol>
              {rec.priorityNote && (
                <p className="text-[11px] mt-2 pt-2" style={{ borderTop: '1px solid var(--surface-border)', color: '#dc2626' }}>{rec.priorityNote}</p>
              )}
            </div>

            {/* Routes */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg p-2.5" style={{ border: `1px solid ${!routeApplied ? 'rgba(37,99,235,0.3)' : 'var(--surface-border)'}`, background: !routeApplied ? 'rgba(37,99,235,0.05)' : 'transparent' }}>
                <div className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: !routeApplied ? '#2563eb' : 'var(--text-muted)' }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: !routeApplied ? '#2563eb' : '#94a3b8' }} /> Current Route{!routeApplied && ' · Active'}
                </div>
                <p className="text-sm font-semibold mt-1">{currentRoute?.distanceKm ?? rec.distanceKm} km · {currentRoute?.etaMin ?? rec.etaMin} min</p>
              </div>
              <div className="rounded-lg p-2.5" style={{ border: `1px solid ${routeApplied ? 'rgba(124,58,237,0.3)' : 'var(--surface-border)'}`, background: routeApplied ? 'rgba(124,58,237,0.05)' : 'transparent' }}>
                <div className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: routeApplied ? '#7c3aed' : 'var(--text-muted)' }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: routeApplied ? '#7c3aed' : '#94a3b8' }} /> Alternative Route{routeApplied && ' · Active'}
                </div>
                <p className="text-sm font-semibold mt-1">{alternativeRoute?.distanceKm ?? (rec.distanceKm + rec.distanceSavedKm).toFixed(1)} km · {alternativeRoute?.etaMin ?? rec.etaMin} min</p>
              </div>
            </div>
            {currentRoute && alternativeRoute && currentRoute.etaMin > alternativeRoute.etaMin && (
              <p className="text-xs text-success-600 font-medium text-center">
                {routeApplied ? 'Applied — ' : ''}Alternative route saves {currentRoute.etaMin - alternativeRoute.etaMin} min travel time
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={onDispatch}
                disabled={requestSent || dispatched}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none"
                style={{ background: dispatched ? '#10b981' : '#2563eb', boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }}
              >
                {dispatched ? (<><CheckCircle2 size={16} /> Dispatched</>) : requestSent ? (<><CheckCircle2 size={16} /> Request Sent</>) : (<><Navigation size={16} /> Send Request</>)}
              </button>
              <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all" style={{ background: 'var(--bg-soft)', border: '1px solid var(--surface-border)', color: 'var(--text-soft)' }}>
                <MapPin size={16} /> View Route
              </button>
            </div>
          </>
        )}

        {scheduled && !rec && !computing && (
          <div className="rounded-lg p-3 text-center" style={{ border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.05)' }}>
            <p className="text-sm font-medium" style={{ color: '#d97706' }}>No available technician in {fault.region} region</p>
            <p className="text-xs muted-text mt-1">All regional crews are currently assigned.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, accent }: { icon: typeof Users; label: string; value: string; accent: string }) {
  return (
    <div className="rounded-lg p-3" style={{ background: 'var(--bg-soft)', border: '1px solid var(--surface-border)' }}>
      <div className="flex items-center gap-1.5 text-[11px] muted-text" style={{ color: accent }}>
        <Icon size={12} />
        <span>{label}</span>
      </div>
      <p className="text-sm font-semibold mt-1.5">{value}</p>
    </div>
  );
}
