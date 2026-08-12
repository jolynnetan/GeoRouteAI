import type { Fault, Technician, Region, AssetType, FaultType, Priority, Skill, Pos, MaintenanceProfile, TrafficSegment, RiskLevel } from '@/types';

let s = 20260805;
function rnd() { s = (s * 1664525 + 1013904223) >>> 0; return s / 0xffffffff; }
function pick<T>(a: T[]): T { return a[Math.floor(rnd() * a.length)]; }
function jit(b: number, a: number) { return b + (rnd() - 0.5) * a; }

const ASSET_TYPES: AssetType[] = ['Cellular Tower', '5G Base Station', 'Fiber Cabinet'];
const FAULT_TYPES: FaultType[] = ['Tower Offline', 'Signal Loss', 'Fiber Cut', 'Power Failure', 'Hardware Fault', 'Backhaul Degraded'];
const PRIORITIES: Priority[] = ['Critical', 'High', 'Medium', 'Low'];
const SKILLS: Skill[] = ['Fiber', '5G', 'Power', 'RF', 'General'];
const CREWS = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel'];

const CENTERS: Record<Region, Pos> = {
  KL: { lat: 3.139, lng: 101.6869 },
  PN: { lat: 5.4141, lng: 100.3288 },
  JB: { lat: 1.4927, lng: 103.7416 },
};

function siteId(region: Region, i: number): string {
  const p = region === 'KL' ? 'KL' : region === 'PN' ? 'PN' : 'JB';
  return `SITE-${p}-${String(i).padStart(3, '0')}`;
}

export function generateFaults(): Fault[] {
  const faults: Fault[] = [];
  const regions: Region[] = ['KL', 'PN', 'JB'];
  const counts: Record<Region, number> = { KL: 9, PN: 6, JB: 5 };
  let idx = 1;
  for (const region of regions) {
    const c = CENTERS[region];
    for (let i = 0; i < counts[region]; i++) {
      const assetType = pick(ASSET_TYPES);
      const priority = pick(PRIORITIES);
      const sla = priority === 'Critical' ? 30 : priority === 'High' ? 60 : priority === 'Medium' ? 180 : 480;
      faults.push({
        id: `FLT-${String(idx).padStart(3, '0')}`,
        assetId: siteId(region, i + 1), assetType, type: pick(FAULT_TYPES), priority, region,
        pos: { lat: jit(c.lat, 0.1), lng: jit(c.lng, 0.12) },
        reportedMin: Math.floor(rnd() * 180) + 5, slaMin: sla, status: 'Reported',
      });
      idx++;
    }
  }
  if (!faults.some((f) => f.priority === 'Critical' && f.region === 'KL')) {
    faults[0].priority = 'Critical'; faults[0].region = 'KL'; faults[0].reportedMin = 8; faults[0].slaMin = 30;
  }
  // Featured demo scenario site — Petaling Jaya 5G base station with a preventive maintenance risk story.
  faults[0].assetId = 'SITE-PJ-031';
  faults[0].assetType = '5G Base Station';
  faults[0].region = 'KL';
  faults[0].pos = { lat: 3.1073, lng: 101.6067 }; // Petaling Jaya, within the Klang Valley region
  return faults;
}

export function generateTechnicians(): Technician[] {
  const techs: Technician[] = [];
  const regions: Region[] = ['KL', 'PN', 'JB'];
  const counts: Record<Region, number> = { KL: 4, PN: 3, JB: 3 };
  for (const region of regions) {
    const c = CENTERS[region];
    for (let i = 0; i < counts[region]; i++) {
      const crew = CREWS[techs.length % CREWS.length];
      const skills = [pick(SKILLS), pick(SKILLS)].filter((v, ix, a) => a.indexOf(v) === ix);
      const available = rnd() > 0.25;
      techs.push({
        id: `TECH-${region}-${i + 1}`, name: `Crew ${crew}`, crew, region,
        pos: { lat: jit(c.lat, 0.08), lng: jit(c.lng, 0.1) }, skills: skills as Skill[], available,
        activeJobs: available ? 0 : Math.floor(rnd() * 2) + 1, slaScore: 80 + Math.floor(rnd() * 20),
        status: available ? 'Available' : pick(['On assignment', 'En route', 'Returning']),
        lifecycleStatus: available ? 'AVAILABLE' : 'ASSIGNED',
      });
    }
  }
  // Featured demo technician — tuned to be the clear best match for SITE-PJ-031
  // (5G + Fiber specialization, available, light workload, ~7-8km away).
  const charlieIdx = techs.findIndex((t) => t.region === 'KL' && t.crew === 'Charlie');
  if (charlieIdx >= 0) {
    techs[charlieIdx] = {
      ...techs[charlieIdx],
      name: 'Crew Charlie',
      skills: ['5G', 'Fiber'],
      available: true,
      activeJobs: 2,
      slaScore: 94,
      pos: { lat: 3.1648, lng: 101.647 }, // ~7.8km from SITE-PJ-031
      status: 'Available',
      lifecycleStatus: 'AVAILABLE',
    };
  }
  return techs;
}

export function generateMaintenanceProfiles(faults: Fault[]): MaintenanceProfile[] {
  return faults.map((fault, index) => {
    const isFeatured = index === 0;
    const previousFaultCount = isFeatured ? 3 : 1 + (index % 3);
    const daysSinceMaintenance = isFeatured ? 74 : 22 + (index * 11) % 58;
    const equipmentAgeYears = isFeatured ? 4.2 : +(1.4 + (index % 6) * 0.6).toFixed(1);
    const signalDegradation = isFeatured ? 68 : 18 + (index * 9) % 42;
    const networkUtilization = isFeatured ? 82 : 48 + (index * 7) % 38;
    const score = Math.max(0, Math.min(100, 100 - previousFaultCount * 5 - daysSinceMaintenance * 0.15 - signalDegradation * 0.18 - equipmentAgeYears * 2 - networkUtilization * 0.08));
    const riskLevel: RiskLevel = score < 42 ? 'CRITICAL' : score < 62 ? 'HIGH' : score < 78 ? 'MEDIUM' : 'LOW';
    const riskFactors = [
      `${previousFaultCount} previous faults`,
      `${daysSinceMaintenance} days since maintenance`,
      `${signalDegradation}% signal degradation`,
      `Equipment age: ${equipmentAgeYears} years`,
    ];
    return {
      siteId: fault.assetId, equipmentAgeYears, previousFaultCount,
      faultFrequency: +(previousFaultCount / Math.max(1, daysSinceMaintenance / 30)).toFixed(1),
      signalDegradation, networkUtilization, maintenanceIntervalDays: 60,
      daysSinceMaintenance, siteHealth: Math.round(score), riskLevel,
      recommendedWindowDays: riskLevel === 'CRITICAL' ? 1 : riskLevel === 'HIGH' ? 5 : riskLevel === 'MEDIUM' ? 14 : 30,
      riskFactors,
    };
  });
}

export const faults = generateFaults();
export const technicians = generateTechnicians();
export const maintenanceProfiles = generateMaintenanceProfiles(faults);

export const trafficSegments: TrafficSegment[] = [
  { id: 'JLN-PJ-01', label: 'Petaling Jaya Federal Highway', state: 'CONGESTED', multiplier: 1.45 },
  { id: 'JLN-KL-02', label: 'Kuala Lumpur Inner Ring', state: 'NORMAL', multiplier: 1 },
  { id: 'JLN-PJ-03', label: 'Sprint Highway', state: 'SEVERELY CONGESTED', multiplier: 1.8 },
  { id: 'JLN-KL-04', label: 'Local access road', state: 'NORMAL', multiplier: 1.05 },
  { id: 'JLN-PJ-05', label: 'Construction diversion', state: 'CLOSED', multiplier: 3 },
];
