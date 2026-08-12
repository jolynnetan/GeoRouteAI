import { CheckCircle2, Clock } from 'lucide-react';

export interface TimelineEvent {
  label: string;
  time: string;
}

interface Props {
  events: TimelineEvent[];
  siteId?: string | null;
  complete?: boolean;
}

export default function MaintenanceTimeline({ events, siteId, complete }: Props) {
  if (events.length === 0) return null;

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-primary-500" />
          <p className="text-sm font-semibold">Maintenance Timeline</p>
        </div>
        {siteId && <span className="text-[11px] muted-text">{siteId}</span>}
      </div>
      <div>
        {events.map((e, i) => {
          const isLast = i === events.length - 1;
          const isFinal = isLast && complete;
          return (
            <div key={`${e.label}-${i}`} className="flex gap-3">
              <div className="flex flex-col items-center">
                <CheckCircle2
                  size={16}
                  className={isFinal ? 'text-success-500' : 'text-primary-500'}
                  style={!isLast ? {} : { opacity: isFinal ? 1 : 0.9 }}
                />
                {!isLast && <div className="w-px flex-1 my-0.5" style={{ background: 'var(--surface-border)', minHeight: 14 }} />}
              </div>
              <div className={isLast ? 'pb-0' : 'pb-3'}>
                <p className="text-xs font-medium">{e.label}</p>
                <p className="text-[11px] muted-text">{e.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
