import type {
  StationDetail,
  SystemValidationAudit,
  ColonizeSearchCriteria,
  BodySummary,
  RingDetail,
  ValuableWorldDetail,
} from './types';

// Known permit-locked sectors and systems in Elite Dangerous
export const KNOWN_PERMIT_LOCKED_PREFIXES = [
  'COL 70 SECTOR',
  'HORSEHEAD DARK SECTOR',
  'REGOR SECTOR',
  'BLEIA',
  'PRAEI',
  'BOVOMIT',
  'SIDGO',
  'DRYMAN',
  'WITCH\'S REACH',
  'HIP 22460',
  'POLARIS',
  'LHS 3447',
  'ROSS 128',
  'SOL',
  'SHINRARTA DEZHRA',
  'ACHENAR',
  'ALIOTH',
  'FACECE',
  'SIRIUS',
  'VEGA',
  'ISINOR',
  'JOTUN',
  'TILIALA',
  'VAN MAANEN\'S STAR',
  'HODACK',
  'LUYTEN 347-14',
  'NEXIFER',
  'PEREGRINA',
  'PI MENTORIS',
  'PLX 695',
  'TERRA MATER',
  'CD-43 11917',
  'CROM',
  'EXIOCE',
];

// Fuel scoopable primary stellar classes: KGBFOAM
export const SCOOPABLE_STAR_TYPES = new Set(['O', 'B', 'A', 'F', 'G', 'K', 'M']);

/**
 * Checks if a given station object represents a player-owned Fleet Carrier.
 */
export function isFleetCarrierStation(station: { type?: string; name?: string }): boolean {
  if (!station) return false;
  const type = (station.type || '').toLowerCase();
  const name = (station.name || '').toUpperCase();

  if (
    type.includes('carrier') ||
    type === 'drake-class carrier' ||
    type === 'fleetcarrier'
  ) {
    return true;
  }

  // Elite Dangerous Fleet Carrier callsign pattern (e.g., "NAUTILUS (V2X-88L)" or "V2X-88L")
  const callsignPattern = /\b[A-Z0-9]{3}-[A-Z0-9]{3}\b/;
  if (callsignPattern.test(name) && !type.includes('starport') && !type.includes('outpost')) {
    return true;
  }

  return false;
}

/**
 * Checks if a station represents an active colonization ship / construction vessel or beacon.
 */
export function isColonizationShip(station: { type?: string; name?: string }): boolean {
  if (!station) return false;
  const type = (station.type || '').toLowerCase();
  const name = (station.name || '').toLowerCase();

  return (
    type.includes('colonisation') ||
    type.includes('colonization') ||
    type.includes('construction') ||
    name.includes('colonisation ship') ||
    name.includes('colonization ship') ||
    name.includes('construction vessel') ||
    name.includes('colony beacon')
  );
}

/**
 * Checks if a system is permit locked based on system name or metadata.
 */
export function isSystemPermitLocked(systemName: string, needsPermit?: boolean, permitName?: string): boolean {
  if (needsPermit || permitName) return true;
  if (!systemName) return false;

  const upperName = systemName.trim().toUpperCase();
  for (const prefix of KNOWN_PERMIT_LOCKED_PREFIXES) {
    if (upperName === prefix || upperName.startsWith(prefix + ' ')) {
      return true;
    }
  }
  return false;
}

/**
 * Checks if the primary star classification is scoopable (KGBFOAM).
 */
export function isStarScoopable(starType?: string): boolean {
  if (!starType) return false;
  const cleanType = starType.trim().toUpperCase().charAt(0);
  return SCOOPABLE_STAR_TYPES.has(cleanType);
}

/**
 * Validates a star system's raw metadata against colonisation eligibility rules.
 */
export function validateSystemInfrastructure(
  systemName: string,
  rawSystemData: {
    population?: number;
    stations?: Array<{ name?: string; type?: string; distance_to_arrival?: number }>;
    controlling_faction?: string | { name?: string } | null;
    factions?: Array<{ name?: string; influence?: number }>;
    minor_factions?: Array<{ name?: string }>;
    government?: string;
    allegiance?: string;
    needs_permit?: boolean;
    permit_name?: string;
    primary_star?: string | { spectral_class?: string; name?: string };
    is_colonised?: boolean;
    colonised?: boolean;
    is_being_colonised?: boolean;
    being_colonised?: boolean;
  }
): SystemValidationAudit {
  const reasons: string[] = [];
  const warnings: string[] = [];
  const stationsFound: StationDetail[] = [];

  let hasPermanentStations = false;
  let hasActiveColonizationShip = false;

  // 1. Stations inspection
  const rawStations = rawSystemData.stations || [];
  for (const st of rawStations) {
    const isCarrier = isFleetCarrierStation(st);
    const isColonyShip = isColonizationShip(st);

    stationsFound.push({
      name: st.name || 'Unknown',
      type: st.type || 'Unknown',
      isFleetCarrier: isCarrier,
      distanceToArrival: st.distance_to_arrival,
    });

    if (isColonyShip) {
      hasActiveColonizationShip = true;
      reasons.push(`Contains active colonisation ship/beacon: "${st.name || st.type}"`);
    } else if (!isCarrier) {
      hasPermanentStations = true;
      reasons.push(`Contains permanent station: "${st.name}" (${st.type || 'Station'})`);
    }
  }

  // 2. Population check
  const population = rawSystemData.population || 0;
  if (population > 0) {
    reasons.push(`Has recorded human population (${population.toLocaleString()} inhabitants)`);
  }

  // 3. Factions & Allegiance check
  let controllingFactionName: string | null = null;
  if (typeof rawSystemData.controlling_faction === 'string') {
    controllingFactionName = rawSystemData.controlling_faction;
  } else if (rawSystemData.controlling_faction && rawSystemData.controlling_faction.name) {
    controllingFactionName = rawSystemData.controlling_faction.name;
  }

  if (
    controllingFactionName &&
    controllingFactionName !== 'None' &&
    controllingFactionName !== '$faction_None;'
  ) {
    reasons.push(`Controlling faction present: "${controllingFactionName}"`);
  }

  const factionsList = rawSystemData.factions || rawSystemData.minor_factions || [];
  const factionsFound: string[] = [];
  for (const f of factionsList) {
    if (f.name && f.name !== 'None' && f.name !== '$faction_None;') {
      factionsFound.push(f.name);
    }
  }
  if (factionsFound.length > 0 && !controllingFactionName) {
    reasons.push(`Minor factions active in system: ${factionsFound.slice(0, 3).join(', ')}`);
  }

  // Government & Allegiance
  const gov = (rawSystemData.government || '').toLowerCase();
  const allegiance = (rawSystemData.allegiance || '').toLowerCase();
  if (gov && gov !== 'none' && gov !== '$government_none;') {
    reasons.push(`System has active government type: ${rawSystemData.government}`);
  }
  if (
    allegiance &&
    allegiance !== 'none' &&
    allegiance !== 'independent' &&
    allegiance !== '$allegiance_none;'
  ) {
    reasons.push(`System pledged to major allegiance: ${rawSystemData.allegiance}`);
  }

  // 4. Colonisation status check
  const isColonised = rawSystemData.is_colonised === true || rawSystemData.colonised === true;
  const isBeingColonised = rawSystemData.is_being_colonised === true || rawSystemData.being_colonised === true;

  if (isColonised) {
    reasons.push('Marked as colonised in database (is_colonised: true)');
  }
  if (isBeingColonised) {
    reasons.push('Active colonisation in progress (is_being_colonised: true)');
  }

  // 5. Permit lock check
  const isPermitLocked = isSystemPermitLocked(
    systemName,
    rawSystemData.needs_permit,
    rawSystemData.permit_name
  );
  if (isPermitLocked) {
    reasons.push(`System is permit locked (${rawSystemData.permit_name || 'Restricted Sector'})`);
  }

  // 6. Primary Star scoopability check
  let primaryStarType = '';
  if (typeof rawSystemData.primary_star === 'string') {
    primaryStarType = rawSystemData.primary_star;
  } else if (rawSystemData.primary_star && rawSystemData.primary_star.spectral_class) {
    primaryStarType = rawSystemData.primary_star.spectral_class;
  }
  const primaryStarScoopable = isStarScoopable(primaryStarType);
  if (primaryStarType && !primaryStarScoopable) {
    warnings.push(`Primary star (${primaryStarType}) is not fuel-scoopable`);
  }

  // Warnings for fleet carriers
  const carrierCount = stationsFound.filter((s) => s.isFleetCarrier).length;
  if (carrierCount > 0) {
    warnings.push(`${carrierCount} player Fleet Carrier(s) present in system`);
  }

  const isValid = reasons.length === 0;
  const isVerifiedClean = isValid && stationsFound.length === 0 && factionsFound.length === 0 && !isColonised && !isBeingColonised;

  return {
    isValid,
    reasons,
    warnings,
    isVerifiedClean,
    hasPermanentStations,
    hasActiveColonizationShip,
    isColonised,
    isBeingColonised,
    stationsFound,
    controllingFaction: controllingFactionName,
    factionsFound,
    isPermitLocked,
    permitName: rawSystemData.permit_name,
    primaryStarScoopable,
    crossChecked: false,
  };
}

/**
 * Extracts a concise summary of celestial bodies and tests against user criteria.
 */
export function extractAndValidateBodies(
  bodies: any[],
  criteria: ColonizeSearchCriteria
): { passesCriteria: boolean; bodySummary: BodySummary; failureReason?: string } {
  let landableCount = 0;
  let blackHoleCount = 0;
  const rings: RingDetail[] = [];
  const valuableWorlds: ValuableWorldDetail[] = [];
  let minArrivalLs = Infinity;

  const validRingTypes = new Set(['Metallic', 'Metal Rich', 'Rocky', 'Icy']);

  for (const b of bodies || []) {
    const isLandable = Boolean(b.is_landable ?? b.isLandable ?? b.landable);
    const arrivalLs = b.distance_to_arrival ?? b.distanceToArrival ?? 0;

    if (arrivalLs > 0 && arrivalLs < minArrivalLs) {
      minArrivalLs = arrivalLs;
    }

    if (isLandable) {
      landableCount++;
    }

    // Black Hole check
    const subtypeRaw = (b.sub_type || b.subType || b.subtype || '').toLowerCase();
    const typeRaw = (b.type || '').toLowerCase();
    if (subtypeRaw.includes('black hole') || (typeRaw === 'star' && subtypeRaw.includes('black hole'))) {
      blackHoleCount++;
    }

    // Rings and asteroid belts check
    const rawRings = [...(b.rings || []), ...(b.belts || [])];
    for (const r of rawRings) {
      const ringType = r.type || 'Unknown';
      const reserve = r.reserve_level || r.reserveLevel || r.reserve || b.reserve_level || b.reserveLevel || 'Unknown';
      rings.push({
        bodyName: b.name,
        name: r.name || 'Ring/Belt',
        type: ringType,
        reserve,
      });
    }

    // Valuable worlds check (Earth-Like, Water World, Ammonia, Terraformable)
    const subType = (b.sub_type || b.subType || '').toLowerCase();
    const isTerraformable = Boolean(
      (b.terraforming_state || b.terraformingState || '').toLowerCase().includes('terraformable')
    );
    const isELW = subType.includes('earth-like') || subType.includes('earthlike');
    const isWaterWorld = subType.includes('water world');
    const isAmmoniaWorld = subType.includes('ammonia world');

    if (isELW || isWaterWorld || isAmmoniaWorld || isTerraformable) {
      valuableWorlds.push({
        name: b.name || 'Unknown',
        subType: b.sub_type || b.subType || 'High Value',
        isTerraformable,
        distanceToArrival: arrivalLs,
      });
    }
  }

  const hasPristineMetallic = rings.some(
    (r) =>
      r.type.toLowerCase().includes('metallic') &&
      (r.reserve || '').toLowerCase().includes('pristine')
  );

  const bodySummary: BodySummary = {
    totalBodies: bodies ? bodies.length : 0,
    landableCount,
    rings,
    hasPristineMetallic,
    valuableWorlds,
    hasBlackHole: blackHoleCount > 0,
    blackHoleCount,
    minArrivalLs: minArrivalLs === Infinity ? undefined : minArrivalLs,
  };

  // Validate Black Hole
  if (criteria.requireBlackHole && blackHoleCount === 0) {
    return {
      passesCriteria: false,
      bodySummary,
      failureReason: 'System does not contain any Black Hole',
    };
  }

  // Validate Landables
  if (criteria.requireLandable) {
    const minRequired = criteria.minLandableCount ?? 1;
    if (landableCount < minRequired) {
      return {
        passesCriteria: false,
        bodySummary,
        failureReason: `Found ${landableCount} landable bodies, requires at least ${minRequired}`,
      };
    }
  }

  // Validate Rings
  if (criteria.requireRings) {
    if (rings.length === 0) {
      return {
        passesCriteria: false,
        bodySummary,
        failureReason: 'System has no planetary rings or asteroid belts',
      };
    }

    if (criteria.ringType && criteria.ringType !== 'any') {
      const matchType = rings.some((r) =>
        r.type.toLowerCase().includes(criteria.ringType!.toLowerCase())
      );
      if (!matchType) {
        return {
          passesCriteria: false,
          bodySummary,
          failureReason: `System lacks rings of type "${criteria.ringType}"`,
        };
      }
    }

    if (criteria.ringReserve && criteria.ringReserve !== 'any') {
      const matchReserve = rings.some((r) =>
        (r.reserve || '').toLowerCase().includes(criteria.ringReserve!.toLowerCase())
      );
      if (!matchReserve) {
        return {
          passesCriteria: false,
          bodySummary,
          failureReason: `System lacks rings with "${criteria.ringReserve}" reserves`,
        };
      }
    }
  }

  // Validate Valuable World
  if (criteria.requireValuableWorld && valuableWorlds.length === 0) {
    return {
      passesCriteria: false,
      bodySummary,
      failureReason: 'System does not contain any ELW, Water World, Ammonia World, or Terraformables',
    };
  }

  // Validate Arrival Distance
  if (
    criteria.maxArrivalDistanceLs &&
    minArrivalLs !== Infinity &&
    minArrivalLs > criteria.maxArrivalDistanceLs
  ) {
    return {
      passesCriteria: false,
      bodySummary,
      failureReason: `Closest body arrival distance (${Math.round(minArrivalLs)} Ls) exceeds max of ${criteria.maxArrivalDistanceLs} Ls`,
    };
  }

  return {
    passesCriteria: true,
    bodySummary,
  };
}
