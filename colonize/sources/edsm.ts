import type { Coordinates } from '../types';

const EDSM_API_BASE = 'https://www.edsm.net';
const cache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes cache

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

// Simple async queue for EDSM rate limiting (max 5 requests per second)
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL_MS = 200;

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const waitTime = Math.max(0, lastRequestTime + MIN_REQUEST_INTERVAL_MS - now);
  lastRequestTime = now + waitTime;
  if (waitTime > 0) {
    await new Promise((res) => setTimeout(res, waitTime));
  }

  return fetch(url, {
    headers: {
      'User-Agent': 'EDTools-Companion/1.0',
    },
  });
}

export interface EdsmSphereSystem {
  id: number;
  name: string;
  distance: number;
  coords: Coordinates;
  information?: {
    population?: number;
    allegiance?: string;
    government?: string;
    faction?: string;
  };
  requirePermit?: boolean;
  permitName?: string;
  primaryStar?: {
    type?: string;
    name?: string;
  };
}

/**
 * Searches systems in a sphere around a reference system via EDSM.
 */
export async function searchEdsmSphere(
  systemName: string,
  radiusLy: number
): Promise<EdsmSphereSystem[]> {
  const cappedRadius = Math.min(100, Math.max(1, radiusLy));
  const cacheKey = `edsm_sphere_${systemName}_${cappedRadius}`;
  const cached = getCached<EdsmSphereSystem[]>(cacheKey);
  if (cached) return cached;

  const url = `${EDSM_API_BASE}/api-v1/sphere-systems?systemName=${encodeURIComponent(
    systemName
  )}&radius=${cappedRadius}&showInformation=1&showCoordinates=1&showPermit=1&showPrimaryStar=1`;

  try {
    const res = await rateLimitedFetch(url);
    if (!res.ok) {
      throw new Error(`EDSM Sphere API returned HTTP ${res.status}`);
    }
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    const results: EdsmSphereSystem[] = data.map((item: any) => ({
      id: item.id,
      name: item.name,
      distance: item.distance,
      coords: {
        x: item.coords?.x ?? 0,
        y: item.coords?.y ?? 0,
        z: item.coords?.z ?? 0,
      },
      information: item.information,
      requirePermit: Boolean(item.requirePermit),
      permitName: item.permitName,
      primaryStar: item.primaryStar,
    }));

    setCache(cacheKey, results);
    return results;
  } catch (err) {
    console.warn(`[EdsmSource] Failed sphere search for ${systemName}:`, err);
    return [];
  }
}

/**
 * Cross-checks a system's stations via EDSM to verify whether any permanent ports or fleet carriers exist.
 */
export async function getEdsmSystemStations(systemName: string): Promise<any[]> {
  const cacheKey = `edsm_stations_${systemName}`;
  const cached = getCached<any[]>(cacheKey);
  if (cached) return cached;

  const url = `${EDSM_API_BASE}/api-system-v1/stations?systemName=${encodeURIComponent(systemName)}`;
  try {
    const res = await rateLimitedFetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const stations = data.stations || [];
    setCache(cacheKey, stations);
    return stations;
  } catch (err) {
    console.warn(`[EdsmSource] Failed to fetch stations for ${systemName}:`, err);
    return [];
  }
}

/**
 * Checks minor factions in a system via EDSM.
 */
export async function getEdsmSystemFactions(systemName: string): Promise<any[]> {
  const cacheKey = `edsm_factions_${systemName}`;
  const cached = getCached<any[]>(cacheKey);
  if (cached) return cached;

  const url = `${EDSM_API_BASE}/api-system-v1/factions?systemName=${encodeURIComponent(systemName)}`;
  try {
    const res = await rateLimitedFetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const factions = data.factions || [];
    setCache(cacheKey, factions);
    return factions;
  } catch (err) {
    console.warn(`[EdsmSource] Failed to fetch factions for ${systemName}:`, err);
    return [];
  }
}

/**
 * Fetches bodies in a system from EDSM to check landability, rings, and reserve levels.
 */
export async function getEdsmSystemBodies(systemName: string): Promise<any[]> {
  const cacheKey = `edsm_bodies_${systemName}`;
  const cached = getCached<any[]>(cacheKey);
  if (cached) return cached;

  const url = `${EDSM_API_BASE}/api-system-v1/bodies?systemName=${encodeURIComponent(systemName)}`;
  try {
    const res = await rateLimitedFetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const bodies = data.bodies || [];
    setCache(cacheKey, bodies);
    return bodies;
  } catch (err) {
    console.warn(`[EdsmSource] Failed to fetch bodies for ${systemName}:`, err);
    return [];
  }
}

/**
 * Coordinates lookup for a reference system by name from EDSM.
 */
export async function getEdsmSystemCoordinates(systemName: string): Promise<Coordinates | null> {
  const cacheKey = `edsm_coords_${systemName.toLowerCase()}`;
  const cached = getCached<Coordinates>(cacheKey);
  if (cached) return cached;

  const url = `${EDSM_API_BASE}/api-v1/system?systemName=${encodeURIComponent(
    systemName.trim()
  )}&showCoordinates=1`;

  try {
    const res = await rateLimitedFetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.coords) {
      const coords: Coordinates = {
        x: data.coords.x,
        y: data.coords.y,
        z: data.coords.z,
      };
      setCache(cacheKey, coords);
      return coords;
    }
    return null;
  } catch (err) {
    console.warn(`[EdsmSource] Failed to fetch coords for ${systemName}:`, err);
    return null;
  }
}

/**
 * Fetches general system info (population, allegiance, government, date) from EDSM.
 */
export async function getEdsmSystemInfo(systemName: string): Promise<any | null> {
  const cacheKey = `edsm_info_${systemName.toLowerCase()}`;
  const cached = getCached<any>(cacheKey);
  if (cached) return cached;

  const url = `${EDSM_API_BASE}/api-v1/system?systemName=${encodeURIComponent(
    systemName.trim()
  )}&showInformation=1&showCoordinates=1`;

  try {
    const res = await rateLimitedFetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    setCache(cacheKey, data);
    return data;
  } catch (err) {
    console.warn(`[EdsmSource] Failed to fetch info for ${systemName}:`, err);
    return null;
  }
}
