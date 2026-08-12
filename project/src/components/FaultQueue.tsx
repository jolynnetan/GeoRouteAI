import { AlertTriangle, ChevronRight } from 'lucide-react';
import type { Fault } from '@/types';
import { PRIORITY_COLOR, PRIORITY_RANK } from '@/types';
import { timeAgo } from '@/lib/geoai';

interface Props {
  faults: Fault[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  dispatchedIds: Set<string>;
}

export default function FaultQueue({ faults, selectedId, onSelect, dispatchedIds }: Props) {
  const sorted = [...faults]
    .filter((f) => f.status === 'Reported')
    .sort((a, b) => {
      const p = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      if (p !== 0) return p;
      return a.reportedMin - b.reportedMin;
    });

  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-primary-500" />
          <div>
            <h3 className="text-sm font-semibold">Active Fault Queue</h3>
            <p className="text-xs muted-text">Auto-sorted by priority · Prototype Data</p>
          </div>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(234,88,12,0.12)', color: '#ea580c' }}>
          {sorted.length} open
        </span>
      </div>
      <div className="overflow-y-auto max-h-[400px] px-3 pb-3 space-y-2">
        {sorted.map((f) => {
          const c = PRIORITY_COLOR[f.priority];
          const sel = f.id === selectedId;
          return (
            <div
              key={f.id}
              onClick={() => onSelect(f.id)}
              className="rounded-lg border p-3 cursor-pointer transition-all duration-200"
              style={{
                borderColor: sel ? '#2563eb' : 'var(--surface-border)',
                background: sel ? 'rgba(37,99,235,0.05)' : 'transparent',
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{f.assetId}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ color: c, background: `${c}1a`, border: `1px solid ${c}40` }}>
                      {f.priority}
                    </span>
                  </div>
                  <p className="text-xs muted-text mt-1">{f.type}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] muted-text">
                    <span>{timeAgo(f.reportedMin)}</span>
                    <span>·</span>
                    <span>SLA {f.slaMin}m</span>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onSelect(f.id); }}
                  className="shrink-0 text-[11px] font-medium px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  style={sel ? { background: '#2563eb', color: '#fff' } : { background: 'var(--bg-soft)', color: 'var(--text-soft)', border: '1px solid var(--surface-border)' }}
                >
                  View <ChevronRight size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
