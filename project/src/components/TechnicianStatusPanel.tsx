import { Navigation, MapPin, Clock, ShieldCheck, ShieldAlert, PlayCircle, CheckCircle2, Wrench, Flag } from 'lucide-react';
import type { TechnicianStatus } from '@/types';

interface Props {
  technicianName: string;
  status: TechnicianStatus | null;
  destinationSiteId: string;
  distanceKm: number;
  etaMin: number;
  etaClock: string;
  slaOnTrack: boolean;
  routeUpdated: boolean;
  onStartTravel?: () => void;
  onSimulateArrival?: () => void;
  onStartMaintenance?: () => void;
  onCompleteMaintenance?: () => void;
}

const STATUS_STYLE: Record<string, { color: string; dot: string }> = {
  ACCEPTED: { color: '#2563eb', dot: '🔵' },
  'EN ROUTE': { color: '#f59e0b', dot: '🟡' },
  ARRIVED: { color: '#7c3aed', dot: '🟣' },
  'MAINTENANCE IN PROGRESS': { color: '#ea580c', dot: '🟠' },
  COMPLETED: { color: '#10b981', dot: '🟢' },
};

export default function TechnicianStatusPanel({ technicianName, status, destinationSiteId, distanceKm, etaMin, etaClock, slaOnTrack, routeUpdated, onStartTravel, onSimulateArrival, onStartMaintenance, onCompleteMaintenance }: Props) {
  if (!status) return null;
  const style = STATUS_STYLE[status] || { color: '#2563eb', dot: '🔵' };
  const showRouteMetrics = status !== 'ACCEPTED';

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <Navigation size={16} className="text-primary-500" />
          <div>
            <h3 className="text-sm font-semibold">{technicianName}</h3>
            <p className="text-xs muted-text">Live tracking · Simulated</p>
          </div>
        </div>
        <span className="text-[11px] px-2 py-1 rounded-full font-bold flex items-center gap-1" style={{ color: style.color, background: `${style.color}1a` }}>
          <span>{style.dot}</span> {status}
        </span>
      </div>
      <div className="px-5 pb-5 space-y-3">
        {status === 'ACCEPTED' && (
          <div className="rounded-lg p-2.5 text-xs soft-text" style={{ background: 'var(--bg-soft)', border: '1px solid var(--surface-border)' }}>
            Assignment accepted for <span className="font-semibold">{destinationSiteId}</span>. Technician has not departed yet.
          </div>
        )}
        {showRouteMetrics && (
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg p-2.5" style={{ background: 'var(--bg-soft)', border: '1px solid var(--surface-border)' }}>
              <p className="text-[10px] muted-text flex items-center gap-1"><MapPin size={11} /> Destination</p>
              <p className="text-xs font-semibold mt-1">{destinationSiteId}</p>
            </div>
            <div className="rounded-lg p-2.5" style={{ background: 'var(--bg-soft)', border: '1px solid var(--surface-border)' }}>
              <p className="text-[10px] muted-text">Distance</p>
              <p className="text-xs font-semibold mt-1">{distanceKm} km</p>
            </div>
            <div className="rounded-lg p-2.5" style={{ background: 'var(--bg-soft)', border: '1px solid var(--surface-border)' }}>
              <p className="text-[10px] muted-text flex items-center gap-1"><Clock size={11} /> Estimated travel</p>
              <p className="text-xs font-semibold mt-1">{etaMin} min</p>
            </div>
            <div className="rounded-lg p-2.5" style={{ background: 'var(--bg-soft)', border: '1px solid var(--surface-border)' }}>
              <p className="text-[10px] muted-text">ETA</p>
              <p className="text-xs font-semibold mt-1">{etaClock}{routeUpdated && <span className="text-[10px] font-normal text-secondary-600 ml-1">(updated)</span>}</p>
            </div>
          </div>
        )}
        {showRouteMetrics && (
          <div className="flex items-center gap-2 rounded-lg p-2.5 text-xs font-medium" style={{
            color: slaOnTrack ? '#10b981' : '#dc2626',
            background: slaOnTrack ? 'rgba(16,185,129,0.08)' : 'rgba(220,38,38,0.08)',
            border: `1px solid ${slaOnTrack ? 'rgba(16,185,129,0.25)' : 'rgba(220,38,38,0.25)'}`,
          }}>
            {slaOnTrack ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
            SLA: {slaOnTrack ? 'ON TRACK' : 'AT RISK'}
          </div>
        )}

        {/* Manual progression — every transition below requires a presenter click */}
        {status === 'ACCEPTED' && onStartTravel && (
          <button onClick={onStartTravel} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white" style={{ background: '#f59e0b' }}>
            <PlayCircle size={16} /> Start Travel
          </button>
        )}
        {status === 'EN ROUTE' && onSimulateArrival && (
          <button onClick={onSimulateArrival} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white" style={{ background: '#7c3aed' }}>
            <Flag size={16} /> Simulate Arrival
          </button>
        )}
        {status === 'ARRIVED' && onStartMaintenance && (
          <button onClick={onStartMaintenance} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white" style={{ background: '#ea580c' }}>
            <Wrench size={16} /> Start Maintenance
          </button>
        )}
        {status === 'MAINTENANCE IN PROGRESS' && onCompleteMaintenance && (
          <button onClick={onCompleteMaintenance} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white" style={{ background: '#10b981' }}>
            <CheckCircle2 size={16} /> Complete Maintenance
          </button>
        )}
      </div>
    </div>
  );
}
