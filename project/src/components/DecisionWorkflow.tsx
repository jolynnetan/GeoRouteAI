import { Network, CheckCircle2 } from 'lucide-react';

const STAGES = [
  { label: 'Risk Detected', desc: 'GeoAI flags elevated maintenance risk' },
  { label: 'Maintenance Recommended', desc: 'Preventive service window calculated' },
  { label: 'Nearby Jobs Identified', desc: 'Spatial proximity search within 10 km' },
  { label: 'Best Technician Recommended', desc: 'Scored by distance, skill, SLA, workload' },
  { label: 'Request Sent', desc: 'Maintenance request sent to technician' },
  { label: 'Technician Accepts', desc: 'Human-in-the-loop approval confirmed' },
  { label: 'Route Calculated', desc: 'Dijkstra shortest path over road network' },
  { label: 'Traffic Changes', desc: 'Simulated congestion detected on route' },
  { label: 'Alternative Route', desc: 'GeoAI evaluates alternate path' },
  { label: 'ETA Updated', desc: 'Arrival time recalculated from new route' },
  { label: 'Technician Arrives', desc: 'On site — maintenance begins' },
  { label: 'Maintenance Completed', desc: 'Work order closed and verified' },
  { label: 'Impact Comparison', desc: 'Before vs GeoRouteAI measurable impact' },
];

export default function DecisionWorkflow({ activeStep, done }: { activeStep: number; done: boolean }) {
  return (
    <div className="card">
      <div className="flex items-center gap-2 px-5 pt-4 pb-3">
        <Network size={16} className="text-secondary-600" />
        <div>
          <h3 className="text-sm font-semibold">GeoAI Decision Engine</h3>
          <p className="text-xs muted-text">End-to-end maintenance workflow · Prototype</p>
        </div>
        <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0" style={{ background: 'rgba(124,58,237,0.12)', color: '#7c3aed' }}>13 stages</span>
      </div>
      <div className="px-5 pb-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
          {STAGES.map((s, i) => {
            const isDone = done || (activeStep >= 0 && i < activeStep);
            const isActive = activeStep === i;
            return (
              <div key={s.label} className="flex items-center gap-2 rounded-lg px-2.5 py-2" style={{
                background: isActive ? 'rgba(37,99,235,0.08)' : isDone ? 'rgba(16,185,129,0.04)' : 'var(--bg-soft)',
                border: `1px solid ${isActive ? 'rgba(37,99,235,0.3)' : isDone ? 'rgba(16,185,129,0.15)' : 'var(--surface-border)'}`,
              }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{
                  background: isActive ? '#2563eb' : isDone ? 'rgba(16,185,129,0.15)' : 'transparent',
                  color: isActive ? '#fff' : isDone ? '#10b981' : 'var(--text-muted)',
                  border: !isActive && !isDone ? '1px solid var(--surface-border)' : 'none',
                }}>
                  {isDone ? <CheckCircle2 size={11} /> : i + 1}
                </div>
                <span className="text-[11px] font-medium leading-tight" style={{ color: isActive ? '#2563eb' : isDone ? 'var(--text)' : 'var(--text-muted)' }}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
