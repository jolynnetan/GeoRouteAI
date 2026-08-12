import { BarChart3, ArrowDownRight, TrendingDown, Info } from 'lucide-react';
import type { ComparisonMetrics } from '@/lib/geoai';

export default function ComparisonTable({ metrics }: { metrics: ComparisonMetrics }) {
  const rows = [
    { label: 'Response Time', manual: `${metrics.responseTime.manual} min`, geo: `${metrics.responseTime.geo} min`, reduction: metrics.responseTime.reduction },
    { label: 'Travel Distance', manual: `${metrics.travelDistance.manual} km`, geo: `${metrics.travelDistance.geo} km`, reduction: metrics.travelDistance.reduction },
    { label: 'Technician Trips', manual: `${metrics.trips.manual}`, geo: `${metrics.trips.geo}`, reduction: metrics.trips.reduction },
  ];

  return (
    <div className="card">
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className="text-primary-500" />
          <div>
            <h3 className="text-sm font-semibold">Manual vs GeoRouteAI</h3>
            <p className="text-xs muted-text">Simulated prototype results for demonstration purposes</p>
          </div>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
          ↓ {metrics.costReduction}% cost
        </span>
      </div>

      <div className="px-5 pb-5 space-y-4">
        {/* Bar comparisons */}
        <div className="space-y-3">
          {rows.slice(0, 2).map((row) => {
            const max = Math.max(parseFloat(row.manual), parseFloat(row.geo));
            const mPct = (parseFloat(row.manual) / max) * 100;
            const gPct = (parseFloat(row.geo) / max) * 100;
            return (
              <div key={row.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium soft-text">{row.label}</span>
                  <span className="text-xs font-semibold text-success-600 flex items-center gap-1"><ArrowDownRight size={12} /> {row.reduction}%</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] muted-text w-14 shrink-0">Manual</span>
                    <div className="flex-1 h-6 rounded-md overflow-hidden" style={{ background: 'var(--bg-soft)' }}>
                      <div className="h-full rounded-md flex items-center px-2 transition-all duration-700" style={{ width: `${mPct}%`, background: 'rgba(124,58,237,0.7)' }}>
                        <span className="text-[10px] font-medium text-white">{row.manual}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] muted-text w-14 shrink-0">GeoRouteAI</span>
                    <div className="flex-1 h-6 rounded-md overflow-hidden" style={{ background: 'var(--bg-soft)' }}>
                      <div className="h-full rounded-md flex items-center px-2 transition-all duration-700" style={{ width: `${gPct}%`, background: 'linear-gradient(90deg,#2563eb,#06b6d4)' }}>
                        <span className="text-[10px] font-medium text-white">{row.geo}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-px" style={{ background: 'var(--surface-border)' }} />

        {/* Stat grid */}
        <div className="grid grid-cols-2 gap-3">
          {rows.map((row) => (
            <div key={row.label} className="rounded-lg p-3" style={{ border: '1px solid var(--surface-border)' }}>
              <p className="text-[11px] muted-text uppercase tracking-wide">{row.label}</p>
              <div className="flex items-baseline gap-2 mt-1.5">
                <div>
                  <span className="text-[10px] muted-text block">Manual</span>
                  <span className="text-sm font-semibold soft-text">{row.manual}</span>
                </div>
                <span className="muted-text">→</span>
                <div>
                  <span className="text-[10px] muted-text block">GeoRouteAI</span>
                  <span className="text-sm font-semibold text-primary-600">{row.geo}</span>
                </div>
              </div>
              <p className="text-[11px] text-success-600 font-medium mt-1.5 flex items-center gap-1"><TrendingDown size={11} /> {row.reduction}% reduction</p>
            </div>
          ))}
          <div className="rounded-lg p-3" style={{ border: '1px solid var(--surface-border)' }}>
            <p className="text-[11px] muted-text uppercase tracking-wide">Est. Operational Cost</p>
            <p className="text-sm font-semibold mt-1.5 text-success-600">↓ {metrics.costReduction}% reduction</p>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-lg p-3" style={{ background: 'var(--bg-soft)', border: '1px solid var(--surface-border)' }}>
          <Info size={14} className="text-muted shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }} />
          <p className="text-[11px] muted-text leading-relaxed">Simulated prototype results for demonstration purposes. Actual savings depend on network density, fleet size, and fault distribution.</p>
        </div>
      </div>
    </div>
  );
}
