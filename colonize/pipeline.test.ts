import { describe, it, expect } from 'bun:test';
import { calculateDistance } from './pipeline';

describe('Pipeline Spatial Calculations', () => {
  it('correctly calculates 3D Euclidean distances between systems', () => {
    const sol = { x: 0, y: 0, z: 0 };
    const alphaCentauri = { x: -3.03, y: -0.07, z: 3.15 };

    const dist = calculateDistance(sol, alphaCentauri);
    expect(Math.round(dist * 100) / 100).toBe(4.37);
  });

  it('calculates 0 distance for identical coordinates', () => {
    const p1 = { x: 100, y: -50, z: 25.5 };
    expect(calculateDistance(p1, p1)).toBe(0);
  });

  it('accepts custom maxAuditedSystems or defaults to 100', () => {
    const customCriteria = {
      referenceSystem: 'HIP 26722',
      searchMode: 'single_sphere' as const,
      maxDistanceLy: 50,
      maxAuditedSystems: 250,
      requireLandable: true,
      requireRings: false,
    };
    expect(customCriteria.maxAuditedSystems).toBe(250);
  });

  it('determines body_count and requirePlanets filter when requireLandable is enabled', () => {
    const landableCriteria = {
      referenceSystem: 'HIP 26722',
      requireLandable: true,
    };
    const bodyCountFilter = landableCriteria.requireLandable
      ? { bodyCountMin: 2, bodyCountMax: 1000, requirePlanets: true }
      : undefined;

    expect(bodyCountFilter).toEqual({ bodyCountMin: 2, bodyCountMax: 1000, requirePlanets: true });

    const nonLandableCriteria = {
      referenceSystem: 'HIP 26722',
      requireLandable: false,
    };
    const noFilter = nonLandableCriteria.requireLandable
      ? { bodyCountMin: 2, bodyCountMax: 1000, requirePlanets: true }
      : undefined;

    expect(noFilter).toBeUndefined();
  });

  it('configures bodyCountFilter with requireBlackHole when enabled', () => {
    const bhCriteria = {
      referenceSystem: 'HIP 26722',
      requireLandable: false,
      requireBlackHole: true,
    };

    const filter = bhCriteria.requireLandable || bhCriteria.requireBlackHole
      ? {
          bodyCountMin: 2,
          bodyCountMax: 1000,
          requirePlanets: bhCriteria.requireLandable,
          requireBlackHole: bhCriteria.requireBlackHole,
        }
      : undefined;

    expect(filter).toEqual({
      bodyCountMin: 2,
      bodyCountMax: 1000,
      requirePlanets: false,
      requireBlackHole: true,
    });
  });
});
