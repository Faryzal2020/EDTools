import type { Coordinates, ClaimHubDetail } from '../types';

const SPANSH_API_BASE = 'https://spansh.co.uk/api';
const cache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 1000 * 60 * 15; // 15 minutes cache

function getCached<T>(key: string): T | null {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.timestamp < CACHE_TTL_MS) {
    return hit.data as T;
  }
  return null;
}

function setCache(key: string, data: any) {
  cache.set(key, { timestamp: Date.now(), data });
}

export interface SpanshSystemSearchResult {
  id64: string | number;
  name: string;
  distance: number;
  coords: Coordinates;
  population?: number;
  primary_star?: string;
  bodies?: any[];
  stations?: any[];
  controlling_faction?: string | null;
  factions?: any[];
  needs_permit?: boolean;
  permit_name?: string;
  is_colonised?: boolean;
  is_being_colonised?: boolean;
  updated_at?: string;
}

/**
 * Resolves a system name to 3D galactic coordinates using Spansh.
 */
export async function getSpanshSystemCoords(systemName: string): Promise<Coordinates | null> {
  const cacheKey = `spansh_coords_${systemName.toLowerCase()}`;
  const cached = getCached<Coordinates>(cacheKey);
  if (cached) return cached;

  try {
    const payload = {
      filters: {
        name: { value: systemName.trim() },
      },
      size: 1,
    };

    const res = await fetch(`${SPANSH_API_BASE}/systems/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'EDTools-Companion/1.0',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const results = data.results || data.values || [];
    if (results.length > 0) {
      const item = results[0];
      const coords: Coordinates = {
        x: item.coords?.x ?? item.x ?? 0,
        y: item.coords?.y ?? item.y ?? 0,
        z: item.coords?.z ?? item.z ?? 0,
      };
      setCache(cacheKey, coords);
      return coords;
    }
    return null;
  } catch (err) {
    console.warn(`[SpanshSource] Failed to resolve coords for ${systemName}:`, err);
    return null;
  }
}

/**
 * Executes a systems search on Spansh using exact reference coordinates and filters.
 * Returns the nearest unpopulated, non-permit-locked systems sorted by distance.
 */
export async function searchSpanshSystems(
  coords: Coordinates,
  minDistanceLy: number,
  maxDistanceLy: number,
  page: number = 0,
  size: number = 20,
  onProgress?: (message: string) => void,
  options?: {
    bodyCountMin?: number;
    bodyCountMax?: number;
    requirePlanets?: boolean;
    requireBlackHole?: boolean;
  }
): Promise<{ total: number; results: SpanshSystemSearchResult[] }> {
  const minBodies = options?.bodyCountMin;
  const maxBodies = options?.bodyCountMax;
  const bodyFilterKey = (minBodies !== undefined || maxBodies !== undefined)
    ? `_bc_${minBodies ?? 2}_${maxBodies ?? 1000}`
    : '';
  const planetFilterKey = options?.requirePlanets ? '_planets' : '';
  const bhFilterKey = options?.requireBlackHole ? '_bh' : '';

  const cacheKey = `spansh_search_${coords.x}_${coords.y}_${coords.z}_${minDistanceLy}_${maxDistanceLy}_${page}_${size}${bodyFilterKey}${planetFilterKey}${bhFilterKey}`;
  const cached = getCached<{ total: number; results: SpanshSystemSearchResult[] }>(cacheKey);
  if (cached) return cached;

  const filters: Record<string, any> = {
    distance: {
      min: minDistanceLy,
      max: maxDistanceLy,
    },
    population: {
      value: 0,
    },
    needs_permit: {
      value: false,
    },
    is_colonised: {
      not: true,
    },
    is_being_colonised: {
      not: true,
    },
  };

  if (minBodies !== undefined || maxBodies !== undefined) {
    filters.body_count = {
      comparison: '<=>',
      value: [minBodies ?? 2, maxBodies ?? 1000],
    };
  }

  if (options?.requireBlackHole) {
    if (options.requirePlanets) {
      filters.bodies = [
        { type: 'Planet' },
        { subtype: 'Black Hole' },
      ];
    } else {
      filters.bodies = [
        { subtype: 'Black Hole' },
      ];
    }
  } else if (options?.requirePlanets) {
    filters.bodies = [{ type: 'Planet' }];
  }

  const payload = {
    filters,
    sort: [
      {
        distance: {
          direction: 'asc',
        },
      },
    ],
    size,
    page,
    reference_coords: {
      x: coords.x,
      y: coords.y,
      z: coords.z,
    },
  };

  console.log(`[SpanshSource] Querying /api/systems/search (${minDistanceLy}–${maxDistanceLy} LY, Page ${page}${bodyFilterKey ? `, bodies: ${minBodies ?? 2}-${maxBodies ?? 1000}` : ''}${options?.requirePlanets ? ', planets required' : ''}${options?.requireBlackHole ? ', black hole required' : ''})...`);

  try {
    const response = await fetch(`${SPANSH_API_BASE}/systems/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'EDTools-Companion/1.0',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Spansh API search returned HTTP ${response.status}: ${response.statusText}`);
    }

    let data = await response.json();

    // Check if Spansh returned an asynchronous job ID
    if (data.job) {
      const jobId = data.job;
      let attempts = 0;
      const maxAttempts = 20;

      while (attempts < maxAttempts) {
        attempts++;
        if (onProgress) onProgress(`Awaiting Spansh job ${jobId.substring(0, 8)}... (${attempts}s)`);
        await new Promise((res) => setTimeout(res, 1000));

        const jobRes = await fetch(`${SPANSH_API_BASE}/results/${jobId}`, {
          headers: { 'User-Agent': 'EDTools-Companion/1.0' },
        });

        if (jobRes.ok) {
          const jobData = await jobRes.json();
          if (jobData.status === 'queued' || jobData.status === 'calculating') {
            continue;
          }
          data = jobData.result || jobData;
          break;
        }
      }
    }

    const rawResults = data.results || data.values || [];
    const totalCount = data.count || data.total || rawResults.length;

    const results: SpanshSystemSearchResult[] = rawResults.map((r: any) => ({
      id64: r.id64 ?? r.id,
      name: r.name,
      distance: r.distance ?? 0,
      coords: {
        x: r.coords?.x ?? r.x ?? 0,
        y: r.coords?.y ?? r.y ?? 0,
        z: r.coords?.z ?? r.z ?? 0,
      },
      population: r.population ?? 0,
      primary_star: r.primary_star?.spectral_class ?? r.primary_star,
      bodies: r.bodies ?? [],
      stations: r.stations ?? [],
      controlling_faction: r.controlling_faction ?? null,
      factions: r.factions ?? [],
      needs_permit: Boolean(r.needs_permit),
      permit_name: r.permit_name,
      is_colonised: r.is_colonised === true,
      is_being_colonised: r.is_being_colonised === true,
      updated_at: r.updated_at,
    }));

    const output = { total: totalCount, results };
    setCache(cacheKey, output);
    return output;
  } catch (err: any) {
    console.error(`[SpanshSource] Error querying Spansh search:`, err);
    throw err;
  }
}

/**
 * Fetches full system details from Spansh by system id64 (including celestial bodies).
 */
export async function getSpanshSystemDetails(id64: string | number): Promise<any | null> {
  const cacheKey = `spansh_sys_${id64}`;
  const cached = getCached<any>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`${SPANSH_API_BASE}/system/${id64}`, {
      headers: { 'User-Agent': 'EDTools-Companion/1.0' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    setCache(cacheKey, data);
    return data;
  } catch (err) {
    console.warn(`[SpanshSource] Failed to fetch system ${id64}:`, err);
    return null;
  }
}

/**
 * Finds the closest populated, colonized star system within 15 LY of target coordinates
 * that has a non-None economy and an active orbital starport or outpost for colonisation claims.
 */
export async function findClosestClaimHub(
  coords: Coordinates
): Promise<ClaimHubDetail | null> {
  const cacheKey = `claim_hub_${coords.x}_${coords.y}_${coords.z}`;
  const cached = getCached<ClaimHubDetail | null>(cacheKey);
  if (cached !== null && cached !== undefined) return cached;

  try {
    const res = await fetch(`${SPANSH_API_BASE}/systems/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'EDTools-Companion/1.0',
      },
      body: JSON.stringify({
        filters: {
          distance: { min: 0, max: 15 },
          population: { comparison: '>', value: 0 },
        },
        sort: [{ distance: { direction: 'asc' } }],
        reference_coords: {
          x: coords.x,
          y: coords.y,
          z: coords.z,
        },
        size: 10,
      }),
    });

    if (!res.ok) {
      setCache(cacheKey, null);
      return null;
    }

    const data = await res.json();
    const orbitalTypes = new Set([
      'Coriolis Starport',
      'Ocellus Starport',
      'Orbis Starport',
      'Outpost',
      'Asteroid base',
      'Megaship',
    ]);

    for (const sys of data.results || data.values || []) {
      if (!sys.population || sys.population <= 0) continue;
      const econ = sys.primary_economy;
      if (!econ || econ.toLowerCase() === 'none') continue;

      const stations = sys.stations || [];
      const orbitalStation = stations.find((st: any) =>
        orbitalTypes.has(st.type) || (st.services && st.services.includes('System Colonisation'))
      );

      if (orbitalStation) {
        const hub: ClaimHubDetail = {
          systemName: sys.name,
          distanceLy: Math.round(sys.distance * 100) / 100,
          population: sys.population,
          primaryEconomy: econ,
          stationName: orbitalStation.name,
          stationType: orbitalStation.type || 'Orbital Station',
          distanceToArrivalLs: Math.round(orbitalStation.distance_to_arrival || 0),
          hasColonisationOffice: orbitalStation.services?.includes('System Colonisation') ?? false,
        };
        setCache(cacheKey, hub);
        return hub;
      }
    }

    setCache(cacheKey, null);
    return null;
  } catch (err) {
    console.warn(`[SpanshSource] Failed to find claim hub near [${coords.x}, ${coords.y}, ${coords.z}]:`, err);
    return null;
  }
}

