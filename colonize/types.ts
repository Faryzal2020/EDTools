export type RingTypeFilter = 'any' | 'Metallic' | 'Metal Rich' | 'Rocky' | 'Icy';
export type RingReserveFilter = 'any' | 'Pristine' | 'Major' | 'Common' | 'Low' | 'Depleted';
export type SearchMode = 'concentric_shells' | 'directional_ray' | 'single_sphere';

export interface Coordinates {
  x: number;
  y: number;
  z: number;
}

export interface ColonizeSearchCriteria {
  referenceSystem: string;
  referenceCoords?: Coordinates;
  searchMode: SearchMode;
  maxDistanceLy: number;
  shellStepLy?: number; // default 15
  targetSystem?: string; // for directional_ray
  requireLandable: boolean;
  minLandableCount?: number;
  requireRings: boolean;
  ringType?: RingTypeFilter;
  ringReserve?: RingReserveFilter;
  requireScoopablePrimary?: boolean;
  requireValuableWorld?: boolean; // Earth-like, Water World, Ammonia, Terraformable
  requireBlackHole?: boolean; // System must contain at least one Black Hole in any position
  maxArrivalDistanceLs?: number;
  validateWithEdsm?: boolean; // cross-check against EDSM to catch API-side false positives
  maxAuditedSystems?: number; // Maximum candidate systems to audit (default 100)
}

export interface ClaimHubDetail {
  systemName: string;
  distanceLy: number;
  population: number;
  primaryEconomy: string;
  stationName: string;
  stationType: string;
  distanceToArrivalLs: number;
  hasColonisationOffice?: boolean;
}

export interface StationDetail {
  name: string;
  type: string;
  isFleetCarrier: boolean;
  distanceToArrival?: number;
}

export interface SystemValidationAudit {
  isValid: boolean;
  reasons: string[];
  warnings: string[];
  isVerifiedClean: boolean;
  hasPermanentStations: boolean;
  hasActiveColonizationShip: boolean;
  isColonised?: boolean;
  isBeingColonised?: boolean;
  stationsFound: StationDetail[];
  controllingFaction: string | null;
  factionsFound: string[];
  isPermitLocked: boolean;
  permitName?: string;
  primaryStarScoopable: boolean;
  crossChecked: boolean;
  spanshUpdatedAt?: string;
  edsmUpdatedAt?: string;
  freshestSource?: 'spansh' | 'edsm' | 'equal';
  freshestTimestamp?: string;
  freshnessSummary?: string;
}

export interface RingDetail {
  bodyName?: string;
  name: string;
  type: string;
  reserve?: string;
}

export interface ValuableWorldDetail {
  name: string;
  subType: string;
  isTerraformable: boolean;
  distanceToArrival?: number;
}

export interface BodySummary {
  totalBodies: number;
  landableCount: number;
  rings: RingDetail[];
  hasPristineMetallic: boolean;
  valuableWorlds: ValuableWorldDetail[];
  hasBlackHole: boolean;
  blackHoleCount: number;
  minArrivalLs?: number;
}

export interface ColonizeCandidate {
  id64: string | number;
  name: string;
  coords: Coordinates;
  distanceLy: number;
  primaryStar?: string;
  isPrimaryStarScoopable: boolean;
  bodySummary: BodySummary;
  hasBlackHole?: boolean;
  closestClaimHub?: ClaimHubDetail | null;
  audit: SystemValidationAudit;
  links: {
    inaraUrl: string;
    spanshUrl: string;
    edsmUrl: string;
  };
}

export interface PipelineProgressEvent {
  type: 'colonize_progress';
  stage: 'locating_reference' | 'scanning_shell' | 'evaluating_bodies' | 'validating_infrastructure' | 'complete' | 'error';
  message: string;
  logType?: 'info' | 'match' | 'skip' | 'error';
  logDetail?: string;
  currentShell?: number;
  totalShells?: number;
  distanceMin?: number;
  distanceMax?: number;
  candidatesFound?: number;
  validatedCount?: number;
  totalCandidates?: number;
}

export interface PipelineMatchEvent {
  type: 'colonize_match';
  system: ColonizeCandidate;
}
