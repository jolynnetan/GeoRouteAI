import React from 'react';

interface DemoScenarioProps {
  showOptimized?: boolean;
  onToggleOptimized?: () => void;
  showBaseline?: boolean;
  onToggleBaseline?: () => void;
  onTriggerFault?: () => void;
  [key: string]: any; // Allows flexibility for any additional legacy props
}

export const DemoScenario: React.FC<DemoScenarioProps> = ({
  showOptimized = true,
  onToggleOptimized,
  showBaseline = false,
  onToggleBaseline,
  onTriggerFault,
}) => {
  return (
    <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-slate-700/60 w-80 space-y-3">
      <div className="flex justify-between items-center mb-1">
        <h3 className="font-bold text-xs tracking-wider uppercase text-slate-300">DEMO CONTROLS</h3>
        <span className="text-xs text-slate-400 font-medium">Live scenario</span>
      </div>

      {/* Show Optimized Routes Button */}
      <button
        onClick={onToggleOptimized}
        className={`w-full py-3 px-4 rounded-xl font-semibold text-left flex items-center justify-between transition-all duration-200 border ${
          showOptimized 
            ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-100 shadow-md shadow-emerald-950/50' 
            : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-800'
        }`}
      >
        <div className="flex items-center space-x-3">
          <span className={`w-3.5 h-3.5 rounded-full transition-colors ${showOptimized ? 'bg-emerald-400 shadow-sm shadow-emerald-400/80' : 'bg-slate-500'}`} />
          <span className="text-sm font-semibold">Show optimized routes</span>
        </div>
      </button>

      {/* Compare Manual Baseline Button */}
      <button
        onClick={onToggleBaseline}
        className={`w-full py-3 px-4 rounded-xl font-semibold text-left flex items-center justify-between transition-all duration-200 border ${
          showBaseline 
            ? 'bg-slate-800 border-slate-500 text-white shadow-md' 
            : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-800'
        }`}
      >
        <div className="flex items-center space-x-3">
          <span className={`w-3.5 h-3.5 rounded-full transition-colors ${showBaseline ? 'bg-purple-300 shadow-sm shadow-purple-300/80' : 'bg-slate-500'}`} />
          <span className="text-sm font-semibold">Compare manual baseline</span>
        </div>
      </button>

      {/* Trigger Critical Fault Button */}
      <button
        onClick={onTriggerFault}
        className="w-full py-3 px-4 rounded-xl font-semibold text-left flex items-center space-x-3 bg-rose-950/70 border border-rose-700/80 text-rose-200 hover:bg-rose-900/80 active:scale-[0.98] transition-all duration-150"
      >
        <span className="text-base">🚨</span>
        <span className="text-sm font-semibold">Trigger critical fault</span>
      </button>
    </div>
  );
};

export default DemoScenario;