import React, { useEffect, useRef, useState } from 'react';
import DemoScenario from './DemoScenario';
import MapLegend from './MapLegend';

declare global {
  interface Window {
    L: any;
  }
}

interface GisMapProps {
  layers?: any;
  faults?: any[];
  technicians?: any[];
  clusters?: any[];
  selectedFaultId?: string | null;
  selectedTechnicianId?: string | null;
  onSelectFault?: (id: string | null) => void;
  onSelectTechnician?: (id: string | null) => void;
  [key: string]: any;
}

const TECHNICIANS = [
  { id: 'T18', lat: 3.1900, lng: 101.7050 },
  { id: 'T09', lat: 3.1750, lng: 101.6980 },
  { id: 'T08', lat: 3.1700, lng: 101.6850 },
  { id: 'T24', lat: 3.1620, lng: 101.6880 },
  { id: 'T17', lat: 3.1500, lng: 101.7480 },
  { id: 'T02', lat: 3.1250, lng: 101.7050 },
  { id: 'T20', lat: 3.0900, lng: 101.6150 },
  { id: 'T23', lat: 3.0800, lng: 101.7300 },
];

const FAULTS = [
  { id: 'F1', priority: 'critical', lat: 3.1450, lng: 101.7120 },
  { id: 'F2', priority: 'critical', lat: 3.1380, lng: 101.7080 },
  { id: 'F3', priority: 'high', lat: 3.1580, lng: 101.6980 },
  { id: 'F4', priority: 'medium', lat: 3.1650, lng: 101.7180 },
  { id: 'F5', priority: 'medium', lat: 3.1520, lng: 101.7600 },
];

const OPTIMIZED_ROUTE_T17 = [
  [3.1500, 101.7480],
  [3.1510, 101.7380],
  [3.1530, 101.7280],
  [3.1480, 101.7180],
  [3.1450, 101.7120],
  [3.1380, 101.7080],
];

const OPTIMIZED_ROUTE_T24 = [
  [3.1620, 101.6880],
  [3.1600, 101.6930],
  [3.1580, 101.6980],
  [3.1550, 101.7050],
  [3.1450, 101.7120],
];

const BASELINE_ROUTE = [
  [3.1500, 101.7480],
  [3.1620, 101.6880],
  [3.1380, 101.7080]
];

export const GisMap: React.FC<GisMapProps> = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const routesGroupRef = useRef<any>(null);

  const [showOptimized, setShowOptimized] = useState<boolean>(true);
  const [showBaseline, setShowBaseline] = useState<boolean>(false);
  const [criticalFault, setCriticalFault] = useState<boolean>(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current || !window.L) return;

    const map = window.L.map(mapContainerRef.current, {
      center: [3.1500, 101.7100],
      zoom: 13,
      zoomControl: true,
    });

    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    }).addTo(map);

    mapInstanceRef.current = map;

    TECHNICIANS.forEach((tech) => {
      const techIcon = window.L.divIcon({
        className: 'custom-tech-pin',
        html: `
          <div style="
            background: #0f172a; 
            border: 2px solid #10b981; 
            color: white; 
            padding: 3px 8px; 
            border-radius: 20px; 
            font-weight: bold; 
            font-size: 11px; 
            font-family: sans-serif;
            box-shadow: 0 4px 10px rgba(0,0,0,0.4); 
            display: flex; 
            align-items: center; 
            gap: 4px;
            white-space: nowrap;
          ">
            <span>👨‍🔧</span> ${tech.id}
          </div>
        `,
        iconSize: [60, 26],
        iconAnchor: [30, 13],
      });
      window.L.marker([tech.lat, tech.lng], { icon: techIcon }).addTo(map);
    });

    FAULTS.forEach((fault) => {
      const color = fault.priority === 'critical' ? '#e11d48' : fault.priority === 'high' ? '#f59e0b' : '#3b82f6';
      const symbol = fault.priority === 'critical' ? '!' : '';

      const faultIcon = window.L.divIcon({
        className: 'custom-fault-pin',
        html: `
          <div style="
            background: ${color}; 
            width: 22px; 
            height: 22px; 
            border-radius: 50%; 
            border: 2.5px solid white; 
            color: white; 
            font-weight: bold; 
            font-size: 12px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            box-shadow: 0 4px 8px rgba(0,0,0,0.5);
          ">
            ${symbol}
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      window.L.marker([fault.lat, fault.lng], { icon: faultIcon }).addTo(map);
    });

    routesGroupRef.current = window.L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const routesGroup = routesGroupRef.current;
    if (!map || !routesGroup || !window.L) return;

    routesGroup.clearLayers();

    if (showOptimized) {
      const line1Bg = window.L.polyline(OPTIMIZED_ROUTE_T17, { color: '#000000', weight: 8, opacity: 0.9 });
      const line2Bg = window.L.polyline(OPTIMIZED_ROUTE_T24, { color: '#000000', weight: 8, opacity: 0.9 });

      const line1 = window.L.polyline(OPTIMIZED_ROUTE_T17, { color: '#0d9488', weight: 4 });
      const line2 = window.L.polyline(OPTIMIZED_ROUTE_T24, { color: '#0d9488', weight: 4 });

      routesGroup.addLayer(line1Bg);
      routesGroup.addLayer(line2Bg);
      routesGroup.addLayer(line1);
      routesGroup.addLayer(line2);
    }

    if (showBaseline) {
      const baseline = window.L.polyline(BASELINE_ROUTE, {
        color: '#64748b',
        weight: 3,
        dashArray: '8, 8',
      });
      routesGroup.addLayer(baseline);
    }
  }, [showOptimized, showBaseline]);

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden font-sans">
      
      {/* Real Interactive Map Canvas */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

      {/* Demo Controls (Top Right) */}
      <div className="absolute top-4 right-4 z-20 max-w-xs pointer-events-auto">
        <DemoScenario
          showOptimized={showOptimized}
          onToggleOptimized={() => setShowOptimized(!showOptimized)}
          showBaseline={showBaseline}
          onToggleBaseline={() => setShowBaseline(!showBaseline)}
          onTriggerFault={() => setCriticalFault((prev) => !prev)}
        />
      </div>

      {/* ONE Map Legend (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-20 max-w-xs pointer-events-auto">
        <MapLegend />
      </div>

      {/* Critical Fault Alert Banner */}
      {criticalFault && (
        <div className="absolute bottom-4 right-4 z-20 bg-rose-950/90 border border-rose-600 text-rose-200 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-md animate-bounce text-xs font-bold flex items-center gap-2 pointer-events-auto">
          <span>🚨</span>
          <span>Critical Fault Triggered! Dynamic Route Optimization Re-calculated.</span>
        </div>
      )}

    </div>
  );
};

export default GisMap;
