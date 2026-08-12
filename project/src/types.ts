export type ViewId = 'dashboard' | 'map' | 'faults' | 'technicians' | 'dispatch' | 'comparison' | 'settings';

export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';
export type FaultType = 'Tower Offline' | 'Signal Loss' | 'Fiber Cut' | 'Power Failure' | 'Hardware Fault' | 'Backhaul Degraded';
export type AssetType = 'Cellular Tower' | '5G Base Station' | 'Fiber Cabinet';
export type Region = 'KL' | 'PN' | 'JB';
export type Skill = 'Fiber' | '5G' | 'Power' | 'RF' | 'General';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TechnicianStatus = 'AVAILABLE' | 'AWAITING RESPONSE' | 'ACCEPTED' | 'ASSIGNED' | 'EN ROUTE' | 'ARRIVED' | 'MAINTENANCE IN PROGRESS' | 'COMPLETED' | 'OFFLINE';
export type MaintenanceStatus = 'RECOMMENDED' | 'REQUEST SENT' | 'AWAITING RESPONSE' | 'ACCEPTED' | 'REJECTED' | 'EN ROUTE' | 'ARRIVED' | 'IN PROGRESS' | 'COMPLETED';

export interface Pos { lat: number; lng: number; }

export interface Fault {
  id: string;
  assetId: string;
  assetType: AssetType;
  type: FaultType;
  priority: Priority;
  region: Region;
  pos: Pos;
  reportedMin: number;
  slaMin: number;
  status: 'Reported' | 'Dispatched' | 'Resolved';
}

export interface Technician {
  id: string;
  name: string;
  crew: string;
  region: Region;
  pos: Pos;
  skills: Skill[];
  available: boolean;
  activeJobs: number;
  slaScore: number;
  status: string;
  lifecycleStatus?: TechnicianStatus;
}

export interface MaintenanceProfile {
  siteId: string;
  equipmentAgeYears: number;
  previousFaultCount: number;
  faultFrequency: number;
  signalDegradation: number;
  networkUtilization: number;
  maintenanceIntervalDays: number;
  daysSinceMaintenance: number;
  siteHealth: number;
  riskLevel: RiskLevel;
  recommendedWindowDays: number;
  riskFactors: string[];
}

export interface TrafficSegment {
  id: string;
  label: string;
  state: 'NORMAL' | 'CONGESTED' | 'SEVERELY CONGESTED' | 'CLOSED';
  multiplier: number;
}

export interface MapLayers {
  sites: boolean;
  faults: boolean;
  technicians: boolean;
  roads: boolean;
  route: boolean;
  clusters: boolean;
  traffic?: boolean;
  closures?: boolean;
  alternativeRoutes?: boolean;
  boundary?: boolean;
}

export type MapStyle = 'light' | 'dark' | 'satellite';

export interface Settings {
  dark: boolean;
  mapStyle: MapStyle;
  layers: MapLayers;
}

export interface ImpactMetrics {
  distanceKm: number;
  travelMin: number;
  fuelLiters: number;
  co2Kg: number;
}

export interface OptimalPlan {
  primarySiteId: string;
  additionalSiteIds: string[];
  technicianName: string;
  serviceWindow: string;
  routeName: string;
  estimated: ImpactMetrics;
  conventional: ImpactMetrics;
  savings: ImpactMetrics;
}

export const PRIORITY_RANK: Record<Priority, number> = {
  Critical: 0, High: 1, Medium: 2, Low: 3,
};

export const PRIORITY_COLOR: Record<Priority, string> = {
  Critical: '#dc2626', High: '#f59e0b', Medium: '#3b82f6', Low: '#0891b2',
};

export const CLUSTER_COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

export const REGIONS: Record<Region, { name: string; center: Pos; zoom: number }> = {
  KL: { name: 'Klang Valley', center: { lat: 3.139, lng: 101.6869 }, zoom: 12 },
  PN: { name: 'Penang', center: { lat: 5.4141, lng: 100.3288 }, zoom: 12 },
  JB: { name: 'Johor', center: { lat: 1.4927, lng: 103.7416 }, zoom: 12 },
};

export const FAULT_SKILL: Record<FaultType, Skill> = {
  'Tower Offline': 'RF',
  'Signal Loss': '5G',
  'Fiber Cut': 'Fiber',
  'Power Failure': 'Power',
  'Hardware Fault': '5G',
  'Backhaul Degraded': 'Fiber',
};
