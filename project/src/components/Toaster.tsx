import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export interface Toast { id: number; title: string; message: string; type: 'success' | 'info' | 'warning' | 'error' }

export default function Toaster({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: number) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[3000] flex flex-col gap-2 w-[340px] max-w-[calc(100vw-2rem)]">
      {toasts.map((t) => {
        const Icon = t.type === 'success' ? CheckCircle2 : t.type === 'error' ? XCircle : t.type === 'warning' ? AlertTriangle : Info;
        const color = t.type === 'success' ? '#10b981' : t.type === 'error' ? '#dc2626' : t.type === 'warning' ? '#f59e0b' : '#2563eb';
        return (
          <div key={t.id} className="glass card animate-toast-in flex items-start gap-3 p-3.5 pr-2">
            <div className="shrink-0 mt-0.5" style={{ color }}><Icon size={18} /></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{t.title}</p>
              <p className="text-xs soft-text mt-0.5">{t.message}</p>
            </div>
            <button onClick={() => dismiss(t.id)} className="shrink-0 p-1 muted-text hover:text-[var(--text)] transition-colors"><X size={14} /></button>
          </div>
        );
      })}
    </div>
  );
}
