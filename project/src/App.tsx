import { useEffect, useMemo, useRef, useState } from 'react';
import { Sun, Moon, Bell, Search, Info } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import KpiCards from '@/components/KpiCards';
import GisMap from '@/components/GisMap';
import FaultQueue from '@/components/FaultQueue';
import DispatchRecommendation from '@/components/DispatchRecommendation';
import RedFlags from '@/components/RedFlags';
import ComparisonTable from '@/components/ComparisonTable';
import Toaster, { type Toast } from '@/components/Toaster';
import TechniciansView from '@/components/TechniciansView';
import SettingsView from '@/components/SettingsView';
import MaintenanceRiskPanel from '@/components/MaintenanceRiskPanel';
import TechnicianAlternatives from '@/components/TechnicianAlternatives';
import TrafficUpdatePanel from '@/components/TrafficUpdatePanel';
import OptimalPlanPanel from '@/components/OptimalPlanPanel';
import DataTransparency from '@/components/DataTransparency';
import MaintenanceTimeline, { type TimelineEvent } from '@/components/MaintenanceTimeline';
import TechnicianStatusPanel from '@/components/TechnicianStatusPanel';
import { faults as initialFaults, technicians as initialTechs, maintenanceProfiles, trafficSegments } from '@/data/geoData';
import type { ViewId, MapLayers, Settings, Fault, Technician, TechnicianStatus, Region } from '@/types';
import { clusterFaults, recommend, buildComparison, buildOptimalPlan, calculateEta, type Recommendation, type Cluster, type Graph } from '@/lib/geoai';
import { loadAllRoadNetworks, mergeGraphs, type OsmRoadNetwork } from '@/lib/osmRoads';

const FALLBACK_GRAPH: Graph = { nodes: [], adj: {} };

const DEFAULT_LAYERS: MapLayers = {
  sites: true, faults: true, technicians: true, roads: true, route: true, clusters: true,
  traffic: false, closures: false, alternativeRoutes: false, boundary: false,
};

const DEFAULT_SETTINGS: Settings = { dark: true, mapStyle: 'dark', layers: DEFAULT_LAYERS };

const PIPELINE_STAGES = [
  'Risk detected — analyzing site health...',
  'Evaluating maintenance risk factors...',
  'Scanning for spatial clusters...',
  'Matching technicians by skill & distance...',
  'Searching road network...',
  'Calculating Dijkstra shortest path...',
  'Generating recommendation...',
];

export default function App() {
  const [view, setView] = useState<ViewId>('dashboard');
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [faults, setFaults] = useState<Fault[]>(initialFaults);
  const [techs, setTechs] = useState<Technician[]>(initialTechs);
  const [selectedFaultId, setSelectedFaultId] = useState<string | null>(null);
  const [rec, setRec] = useState<Recommendation | null>(null);
  const [computing, setComputing] = useState(false);
  const [stage, setStage] = useState('');
  const [activeStep, setActiveStep] = useState(-1);
  const [dispatchedIds, setDispatchedIds] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const [showAlternatives, setShowAlternatives] = useState(false);
  const [manualPicker, setManualPicker] = useState(false);
  const workflowTimers = useRef<number[]>([]);
  const [routeApplied, setRouteApplied] = useState(false);
  const [showDataInfo, setShowDataInfo] = useState(false);
  const [techStatus, setTechStatus] = useState<TechnicianStatus | null>(null);
  const [maintenanceScheduled, setMaintenanceScheduled] = useState(false);
  const [trafficTriggered, setTrafficTriggered] = useState(false);
  const [roadGraph, setRoadGraph] = useState<Graph>(FALLBACK_GRAPH);
  const [roadSource, setRoadSource] = useState<string | null>(null);
  const [roadLoading, setRoadLoading] = useState(true);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [timelineComplete, setTimelineComplete] = useState(false);
  const timelineBaseRef = useRef<Date | null>(null);

  function clockAt(offsetMin: number): string {
    if (!timelineBaseRef.current) timelineBaseRef.current = new Date();
    const t = new Date(timelineBaseRef.current.getTime() + offsetMin * 60000);
    return t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function logTimelineEvent(label: string, offsetMin: number) {
    const time = clockAt(offsetMin);
    setTimelineEvents((evts) => [...evts, { label, time }]);
  }

  function clearWorkflowTimers() {
    workflowTimers.current.forEach((id) => window.clearTimeout(id));
    workflowTimers.current = [];
  }

  function resetTimeline() {
    clearWorkflowTimers();
    timelineBaseRef.current = null;
    setTimelineEvents([]);
    setTimelineComplete(false);
  }

  useEffect(() => {
    let cancelled = false;
    loadAllRoadNetworks().then((networks: Record<Region, OsmRoadNetwork>) => {
      if (cancelled) return;
      const merged = mergeGraphs(networks);
      const sources = Object.values(networks).map((n) => n.source);
      const primary = sources[0];
      setRoadGraph(merged);
      setRoadSource(primary === 'overpass-api' ? 'OpenStreetMap (Overpass API)' : 'OpenStreetMap landmarks (offline fallback)');
      setRoadLoading(false);
    }).catch(() => {
      if (cancelled) return;
      setRoadLoading(false);
      setRoadSource('OpenStreetMap landmarks (offline fallback)');
    });
    return () => { cancelled = true; };
  }, []);

  const layers: MapLayers = settings.layers;
  const profiles = maintenanceProfiles;

  const clusters: Cluster[] = useMemo(() => clusterFaults(faults), [faults]);
  const selectedFault = useMemo(() => faults.find((f) => f.id === selectedFaultId) || null, [faults, selectedFaultId]);
  const selectedProfile = useMemo(() => selectedFault ? profiles.find((p) => p.siteId === selectedFault.assetId) || null : null, [selectedFault, profiles]);

  useEffect(() => {
    if (!selectedFault || !maintenanceScheduled) { setRec(null); setActiveStep(-1); return; }
    let cancelled = false;
    setComputing(true);
    setRec(null);
    setActiveStep(0);
    let i = 0;
    const interval = setInterval(() => {
      if (cancelled) return clearInterval(interval);
      setStage(PIPELINE_STAGES[i]);
      setActiveStep(i);
      i++;
      if (i >= PIPELINE_STAGES.length) {
        clearInterval(interval);
        const recommendation = recommend(roadGraph, selectedFault, techs, clusters);
        if (!cancelled) { setRec(recommendation); setComputing(false); setActiveStep(-1); }
      }
    }, 420);
    return () => { cancelled = true; clearInterval(interval); };
  }, [selectedFault, maintenanceScheduled, clusters, techs, roadGraph]);

  useEffect(() => { setMaintenanceScheduled(false); }, [selectedFaultId]);
  useEffect(() => { document.documentElement.classList.toggle('dark', settings.dark); }, [settings.dark]);

  function pushToast(title: string, message: string) {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, title, message, type: 'success' }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5000);
  }
  function dismissToast(id: number) { setToasts((t) => t.filter((x) => x.id !== id)); }

  // Step 1: Start Travel
  function startTravel() {
    if (!rec || !selectedFault) return;
    setTechStatus('EN ROUTE');
    logTimelineEvent('En route', 1);
  }

  // Step 2: Simulate Arrival
  function simulateArrival() {
    if (!rec || !selectedFault) return;
    const faultId = selectedFault.id;
    const assetId = selectedFault.assetId;
    const techId = rec.technician.id;
    const techName = rec.technician.name;
    const arrivalPos = selectedFault.pos;
    const etaAtArrival = activeRoute?.etaMin ?? rec.etaMin;
    setTechStatus('ARRIVED');
    setDispatchedIds((s) => new Set(s).add(faultId));
    setTechs((ts) => ts.map((t) => t.id === techId ? { ...t, available: false, activeJobs: t.activeJobs + 1, pos: arrivalPos, lifecycleStatus: 'ARRIVED' } : t));
    setFaults((fs) => fs.map((f) => f.id === faultId ? { ...f, status: 'Dispatched' } : f));
    pushToast('Technician Arrived', `${techName} arrived at ${assetId}.`);
    logTimelineEvent('Arrived', etaAtArrival);
  }

  // Step 3: Start Maintenance
  function startMaintenance() {
    if (!rec) return;
    const etaAtArrival = activeRoute?.etaMin ?? rec.etaMin;
    setTechStatus('MAINTENANCE IN PROGRESS');
    logTimelineEvent('Maintenance started', etaAtArrival + 1);
  }

  // Step 4: Complete Maintenance
  function completeMaintenance() {
    if (!rec || !selectedFault) return;
    const faultId = selectedFault.id;
    const etaAtArrival = activeRoute?.etaMin ?? rec.etaMin;
    setTechStatus('COMPLETED');
    setTimelineComplete(true);
    setFaults((fs) => fs.map((f) => f.id === faultId ? { ...f, status: 'Resolved' } : f));
    logTimelineEvent('Maintenance completed', etaAtArrival + 1 + 30);
    pushToast('Maintenance Complete', `${selectedFault.assetId} service completed successfully.`);
  }

  // 🚀 AUTOMATED DISPATCH SEQUENCE (Driven purely by Dispatcher Action)
  function handleDispatch() {
    if (!rec || !selectedFault) return;
    clearWorkflowTimers();

    const techName = rec.technician.name;
    setTechStatus('AWAITING RESPONSE');
    pushToast('Request Sent', `Dispatch request sent to ${techName}.`);

    // 1. Auto Accept (0.8s)
    const t1 = window.setTimeout(() => {
      setTechStatus('ACCEPTED');
      logTimelineEvent('Assignment accepted', 0);
      pushToast('Auto-Confirmed', `${techName} accepted the job assignment.`);
    }, 800);

    // 2. Auto En Route / Start Travel (1.8s)
    const t2 = window.setTimeout(() => {
      startTravel();
      pushToast('En Route', `${techName} is now travelling to the site.`);
    }, 1800);

    // 3. Auto Simulate Arrival (3.8s)
    const t3 = window.setTimeout(() => {
      simulateArrival();
    }, 3800);

    // 4. Auto Start Maintenance (4.8s)
    const t4 = window.setTimeout(() => {
      startMaintenance();
      pushToast('Maintenance Started', `Technician started work on ${selectedFault.assetId}.`);
    }, 4800);

    // 5. Auto Complete Maintenance (6.8s)
    const t5 = window.setTimeout(() => {
      completeMaintenance();
    }, 6800);

    workflowTimers.current = [t1, t2, t3, t4, t5];
  }

  function chooseTechnician(newRec: Recommendation) {
    clearWorkflowTimers();
    setShowAlternatives(false);
    setManualPicker(false);
    setRec(newRec);
    setTechStatus(null);
    pushToast(newRec.manualOverride ? 'Maintainer Assigned' : 'Technician Reassigned', `${newRec.technician.name} assigned.`);
  }

  function openTechnicianPicker() {
    setManualPicker(true);
    setShowAlternatives(true);
  }

  function triggerTraffic() {
    setTrafficTriggered(true);
    pushToast('Road Network Alert', 'Congestion detected on the current route.');
  }

  function scheduleMaintenance() {
    setMaintenanceScheduled(true);
  }

  function resetDemo() {
    clearWorkflowTimers();
    setFaults(initialFaults);
    setTechs(initialTechs);
    setDispatchedIds(new Set());
    setSelectedFaultId(null);
    setRec(null);
    setShowAlternatives(false);
    setManualPicker(false);
    setRouteApplied(false);
    setTechStatus(null);
    setMaintenanceScheduled(false);
    setTrafficTriggered(false);
    resetTimeline();
    setView('dashboard');
    pushToast('Demo Reset', 'All prototype data restored to initial state.');
  }

  const comparison = useMemo(() => buildComparison(rec), [rec]);
  const optimalPlan = useMemo(() => {
    if (!rec || !selectedFault) return null;
    const cluster = clusters.find(c => c.faultIds.includes(selectedFault.id));
    const additionalIds = cluster ? cluster.faultIds.filter(id => id !== selectedFault.id).map(id => faults.find(f => f.id === id)?.assetId || '').filter(Boolean) : [];
    return buildOptimalPlan(selectedFault.assetId, additionalIds, rec.technician.name);
  }, [rec, selectedFault, clusters, faults]);

  const kpis = useMemo(() => {
    const active = faults.filter((f) => f.status === 'Reported').length;
    const crit = faults.filter((f) => f.priority === 'Critical' && f.status === 'Reported').length;
    const avail = techs.filter((t) => t.available).length;
    const avgResp = rec ? rec.etaMin : 30;
    const avgDist = rec ? rec.distanceKm : 13.1;
    const eff = rec ? Math.round((1 - rec.distanceKm / (rec.distanceKm * 1.42)) * 100) : 29;
    return { active, crit, avail, avgResp, avgDist, eff };
  }, [faults, techs, rec]);

  const route = rec?.route ?? null;
  const altRoute = rec?.altRoute ?? null;
  const selectedTech = useMemo(() => {
    if (!rec) return null;
    return { ...rec.technician, lifecycleStatus: techStatus || rec.technician.lifecycleStatus };
  }, [rec, techStatus]);

  const routeInfo = useMemo(() => {
    if (!rec) return null;
    const currentDistanceKm = rec.distanceKm;
    const current = calculateEta(currentDistanceKm, trafficSegments, true);
    const altDistanceKm = +(rec.distanceKm + rec.distanceSavedKm).toFixed(1);
    const altSegments = trafficSegments.filter((s) => s.state !== 'SEVERELY CONGESTED' && s.state !== 'CLOSED');
    const alternative = calculateEta(altDistanceKm, altSegments, true);
    return { current, alternative };
  }, [rec, trafficSegments]);

  const activeRoute = routeInfo ? (routeApplied ? routeInfo.alternative : routeInfo.current) : null;
  const activeEtaClock = rec && activeRoute ? clockAt(activeRoute.etaMin) : '';
  const slaOnTrack = activeRoute ? activeRoute.etaMin <= (selectedFault?.slaMin ?? 9999) : true;
  const etaSavedMin = routeInfo ? Math.max(0, routeInfo.current.etaMin - routeInfo.alternative.etaMin) : 0;

  const mapActiveGeometry = routeApplied ? altRoute : route;
  const mapOtherGeometry = routeApplied ? route : altRoute;

  const showTraffic = !!rec && techStatus !== null && techStatus !== 'AWAITING RESPONSE' && techStatus !== 'ACCEPTED';
  const showOptimalPlan = !!optimalPlan && dispatchedIds.size > 0;

  function applyAlternativeRoute() {
    setRouteApplied(true);
    pushToast('Alternative Route Applied', `Estimated arrival improved by ${etaSavedMin} minute${etaSavedMin === 1 ? '' : 's'}.`);
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Sidebar active={view} onNavigate={setView} dark={settings.dark} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 shrink-0 glass border-b flex items-center justify-between px-5" style={{ borderColor: 'var(--surface-border)' }}>
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold capitalize">{view === 'comparison' ? 'Performance Comparison' : view}</h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>● Live · Dispatcher Prototype</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs muted-text" style={{ background: 'var(--bg-soft)', border: '1px solid var(--surface-border)' }}>
              <Search size={13} /> Search sites, faults, crews...
            </div>
            <button onClick={() => setShowDataInfo(true)} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[var(--bg-soft)] transition-colors" title="Data & GeoAI Information">
              <Info size={16} className="soft-text" />
            </button>
            <button className="relative w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[var(--bg-soft)] transition-colors">
              <Bell size={16} className="soft-text" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-error-500" />
            </button>
            <button onClick={() => setSettings({ ...settings, dark: !settings.dark })} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[var(--bg-soft)] transition-colors">
              {settings.dark ? <Sun size={16} className="soft-text" /> : <Moon size={16} className="soft-text" />}
            </button>
            <div className="flex items-center gap-2 pl-2 border-l" style={{ borderColor: 'var(--surface-border)' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)' }}>DS</div>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold">Dispatcher</div>
                <div className="text-[10px] muted-text">NOC · Malaysia</div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-5 pb-20 md:pb-5">
          {view === 'dashboard' && (
            <div className="space-y-4 animate-fade-in">
              <KpiCards activeFaults={kpis.active} criticalFaults={kpis.crit} availableTechs={kpis.avail} avgResponseMin={kpis.avgResp} avgTravelKm={kpis.avgDist} efficiency={kpis.eff} />
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-2 space-y-4">
                  <div className="relative rounded-xl overflow-hidden border border-slate-800" style={{ height: 440 }}>
                    <GisMap layers={layers} faults={faults} technicians={techs} clusters={clusters} selectedFaultId={selectedFaultId} onSelectFault={setSelectedFaultId} route={mapActiveGeometry} altRoute={mapOtherGeometry} mapStyle={settings.mapStyle} traffic={trafficSegments} selectedTech={selectedTech} graph={roadGraph} roadSource={roadSource} />
                  </div>
                  <RedFlags faults={faults} technicians={techs} clusters={clusters} profiles={profiles} onSelect={(id: string) => setSelectedFaultId(id)} />
                </div>
                <div className="space-y-4">
                  <MaintenanceRiskPanel profile={selectedProfile} />
                  <DispatchRecommendation fault={selectedFault} rec={rec} computing={computing} stage={stage} onDispatch={handleDispatch} scheduled={maintenanceScheduled} onSchedule={scheduleMaintenance} requestSent={techStatus !== null} dispatched={selectedFault ? dispatchedIds.has(selectedFault.id) : false} routeApplied={routeApplied} currentRoute={routeInfo?.current ?? null} alternativeRoute={routeInfo?.alternative ?? null} onChangeTechnician={openTechnicianPicker} />
                  {showAlternatives && rec && selectedFault && (
                    <TechnicianAlternatives fault={selectedFault} technicians={techs} graph={roadGraph} rejectedId={rec.technician.id} rejectedName={null} rejectionReason={null} onAssign={chooseTechnician} onClose={() => { setShowAlternatives(false); setManualPicker(false); }} manual={manualPicker} />
                  )}
                  {rec && selectedFault && techStatus && (
                    <TechnicianStatusPanel technicianName={rec.technician.name} status={techStatus} destinationSiteId={selectedFault.assetId} distanceKm={activeRoute?.distanceKm ?? rec.distanceKm} etaMin={activeRoute?.etaMin ?? rec.etaMin} etaClock={activeEtaClock} slaOnTrack={slaOnTrack} routeUpdated={routeApplied} onStartTravel={startTravel} onSimulateArrival={simulateArrival} onStartMaintenance={startMaintenance} onCompleteMaintenance={completeMaintenance} />
                  )}
                  <MaintenanceTimeline events={timelineEvents} siteId={selectedFault?.assetId ?? null} complete={timelineComplete} />
                  <FaultQueue faults={faults} selectedId={selectedFaultId} onSelect={setSelectedFaultId} dispatchedIds={dispatchedIds} />
                </div>
              </div>
            </div>
          )}

          {view === 'map' && (
            <div className="space-y-4 h-full animate-fade-in">
              <div className="relative rounded-xl overflow-hidden border border-slate-800 h-[calc(100vh-8rem)]">
                <GisMap layers={layers} faults={faults} technicians={techs} clusters={clusters} selectedFaultId={selectedFaultId} onSelectFault={setSelectedFaultId} route={mapActiveGeometry} altRoute={mapOtherGeometry} mapStyle={settings.mapStyle} traffic={trafficSegments} selectedTech={selectedTech} graph={roadGraph} roadSource={roadSource} />
              </div>
            </div>
          )}

          {view === 'faults' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in">
              <FaultQueue faults={faults} selectedId={selectedFaultId} onSelect={(id: string) => { setSelectedFaultId(id); setView('dispatch'); }} dispatchedIds={dispatchedIds} />
              <div className="space-y-4">
                <MaintenanceRiskPanel profile={selectedProfile} />
                <DispatchRecommendation fault={selectedFault} rec={rec} computing={computing} stage={stage} onDispatch={handleDispatch} scheduled={maintenanceScheduled} onSchedule={scheduleMaintenance} requestSent={techStatus !== null} dispatched={selectedFault ? dispatchedIds.has(selectedFault.id) : false} routeApplied={routeApplied} currentRoute={routeInfo?.current ?? null} alternativeRoute={routeInfo?.alternative ?? null} onChangeTechnician={openTechnicianPicker} />
                {showAlternatives && rec && selectedFault && (
                  <TechnicianAlternatives fault={selectedFault} technicians={techs} graph={roadGraph} rejectedId={rec.technician.id} rejectedName={null} rejectionReason={null} onAssign={chooseTechnician} onClose={() => { setShowAlternatives(false); setManualPicker(false); }} manual={manualPicker} />
                )}
              </div>
            </div>
          )}

          {view === 'technicians' && <div className="animate-fade-in"><TechniciansView technicians={techs} /></div>}

          {view === 'dispatch' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in">
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden border border-slate-800" style={{ height: 420 }}>
                  <GisMap layers={layers} faults={faults} technicians={techs} clusters={clusters} selectedFaultId={selectedFaultId} onSelectFault={setSelectedFaultId} route={mapActiveGeometry} altRoute={mapOtherGeometry} mapStyle={settings.mapStyle} traffic={trafficSegments} selectedTech={selectedTech} graph={roadGraph} roadSource={roadSource} />
                </div>
                {showAlternatives && rec && selectedFault && (
                  <TechnicianAlternatives fault={selectedFault} technicians={techs} graph={roadGraph} rejectedId={rec.technician.id} rejectedName={null} rejectionReason={null} onAssign={chooseTechnician} onClose={() => { setShowAlternatives(false); setManualPicker(false); }} manual={manualPicker} />
                )}
              </div>
              <div className="space-y-4">
                <DispatchRecommendation fault={selectedFault} rec={rec} computing={computing} stage={stage} onDispatch={handleDispatch} scheduled={maintenanceScheduled} onSchedule={scheduleMaintenance} requestSent={techStatus !== null} dispatched={selectedFault ? dispatchedIds.has(selectedFault.id) : false} routeApplied={routeApplied} currentRoute={routeInfo?.current ?? null} alternativeRoute={routeInfo?.alternative ?? null} onChangeTechnician={openTechnicianPicker} />
                {rec && selectedFault && techStatus && (
                  <TechnicianStatusPanel technicianName={rec.technician.name} status={techStatus} destinationSiteId={selectedFault.assetId} distanceKm={activeRoute?.distanceKm ?? rec.distanceKm} etaMin={activeRoute?.etaMin ?? rec.etaMin} etaClock={activeEtaClock} slaOnTrack={slaOnTrack} routeUpdated={routeApplied} onStartTravel={startTravel} onSimulateArrival={simulateArrival} onStartMaintenance={startMaintenance} onCompleteMaintenance={completeMaintenance} />
                )}
                {showTraffic && routeInfo && (
                  <TrafficUpdatePanel
                    traffic={trafficSegments}
                    detected={trafficTriggered}
                    onDetect={triggerTraffic}
                    currentDistanceKm={routeInfo.current.distanceKm}
                    currentEta={routeInfo.current.etaMin}
                    alternativeDistanceKm={routeInfo.alternative.distanceKm}
                    alternativeEta={routeInfo.alternative.etaMin}
                    slaOnTrack={slaOnTrack}
                    applied={routeApplied}
                    onApply={applyAlternativeRoute}
                  />
                )}
                {showOptimalPlan && optimalPlan && (
                  <OptimalPlanPanel plan={optimalPlan} />
                )}
                <MaintenanceTimeline events={timelineEvents} siteId={selectedFault?.assetId ?? null} complete={timelineComplete} />
                <FaultQueue faults={faults} selectedId={selectedFaultId} onSelect={setSelectedFaultId} dispatchedIds={dispatchedIds} />
              </div>
            </div>
          )}

          {view === 'comparison' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h2 className="text-lg font-bold">Performance Comparison</h2>
                <p className="text-xs muted-text">Manual dispatch vs GeoRouteAI intelligent dispatch · Simulated / Estimated Prototype Impact</p>
              </div>
              <ComparisonTable metrics={comparison} />
              {optimalPlan && <OptimalPlanPanel plan={optimalPlan} />}
              <RedFlags faults={faults} technicians={techs} clusters={clusters} profiles={profiles} onSelect={(id: string) => setSelectedFaultId(id)} />
            </div>
          )}

          {view === 'settings' && (
            <div className="animate-fade-in"><SettingsView settings={settings} setSettings={setSettings} onReset={resetDemo} onShowDataInfo={() => setShowDataInfo(true)} /></div>
          )}
        </main>
      </div>

      <Toaster toasts={toasts} dismiss={dismissToast} />
      <DataTransparency open={showDataInfo} onClose={() => setShowDataInfo(false)} />
    </div>
  );
}