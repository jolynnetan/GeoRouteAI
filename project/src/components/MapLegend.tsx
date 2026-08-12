import { UserRound } from 'lucide-react';

const DOT = (color: string, size = 12) => (
  <span
    className="inline-block rounded-full shrink-0"
    style={{ width: size, height: size, background: color, border: '2px solid #fff', boxShadow: '0 1px 4px rgba(0,0,0,.4)' }}
  />
);

export default function MapLegend() {
  return (
    <div
      className="rounded-xl px-3.5 py-3 text-xs"
      style={{ background: 'rgba(7,17,27,.92)', border: '1px solid #29445b', color: '#eef7ff', backdropFilter: 'blur(10px)', boxShadow: '0 12px 32px rgba(0,0,0,.35)', minWidth: 168 }}
    >
      <p className="font-bold tracking-wide mb-2" style={{ fontSize: 10, color: '#bcd0e1', letterSpacing: '0.08em' }}>MAP LEGEND</p>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">{DOT('#dc2626', 14)}<span>Critical fault</span></div>
        <div className="flex items-center gap-2">{DOT('#f59e0b', 12)}<span>High priority</span></div>
        <div className="flex items-center gap-2">{DOT('#3b82f6', 10)}<span>Medium priority</span></div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center rounded-full shrink-0" style={{ width: 14, height: 14, background: '#0a2c2b', border: '2px solid #64f0c5' }}>
            <UserRound size={8} color="#64f0c5" strokeWidth={3} />
          </span>
          <span>Technician</span>
        </div>
        <div className="flex items-center gap-2"><span style={{ width: 16, height: 3, borderRadius: 2, background: '#38c7ff' }} /><span>GeoRouteAI route</span></div>
        <div className="flex items-center gap-2">
          <span style={{ width: 16, height: 0, borderTop: '2px dashed #64748b' }} />
          <span>Manual baseline</span>
        </div>
      </div>
    </div>
  );
}
