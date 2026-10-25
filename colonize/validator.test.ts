import { describe, it, expect } from 'bun:test';
import {
  isFleetCarrierStation,
  isColonizationShip,
  isSystemPermitLocked,
  isStarScoopable,
  validateSystemInfrastructure,
  extractAndValidateBodies,
} from './validator';
import type { ColonizeSearchCriteria } from './types';

describe('System Colonisation Validator & Edge-Case Audit', () => {
  describe('Station & Fleet Carrier Discrimination', () => {
    it('identifies Drake-Class Carriers and callsigns as Fleet Carriers', () => {
      expect(isFleetCarrierStation({ type: 'Drake-Class Carrier', name: 'BEACON-1' })).toBe(true);
      expect(isFleetCarrierStation({ type: 'FleetCarrier', name: 'INVINCIBLE' })).toBe(true);
      expect(isFleetCarrierStation({ type: '', name: 'EXPLORER II (V2X-88L)' })).toBe(true);
      expect(isFleetCarrierStation({ type: '', name: 'ABC-123' })).toBe(true);
    });

    it('identifies permanent stations and ports correctly', () => {
      expect(isFleetCarrierStation({ type: 'Coriolis Starport', name: 'Jameson Memorial' })).toBe(false);
      expect(isFleetCarrierStation({ type: 'Outpost', name: 'Mining Facility' })).toBe(false);
      expect(isFleetCarrierStation({ type: 'Planetary Port', name: 'Feynman Terminal' })).toBe(false);
      expect(isFleetCarrierStation({ type: 'Settlement', name: 'Bio Lab 1' })).toBe(false);
      expect(isFleetCarrierStation({ type: 'AsteroidBase', name: 'Pirate Cove' })).toBe(false);
    });

    it('identifies active colonization ships and beacons', () => {
      expect(isColonizationShip({ type: 'Colonisation Ship', name: 'System Builder' })).toBe(true);
      expect(isColonizationShip({ type: 'Megaship', name: 'Construction Vessel Alpha' })).toBe(true);
      expect(isColonizationShip({ type: 'Station', name: 'Colony Beacon 42' })).toBe(true);
      expect(isColonizationShip({ type: 'Coriolis Starport', name: 'Mainzer Colony' })).toBe(false);
    });
  });

  describe('Permit Lock Identification', () => {
    it('catches known permit-locked systems and sectors', () => {
      expect(isSystemPermitLocked('Col 70 Sector FY-N c21-3')).toBe(true);
      expect(isSystemPermitLocked('Horsehead Dark Sector GW-W d1-24')).toBe(true);
      expect(isSystemPermitLocked('Regor Sector ZE-R c4-12')).toBe(true);
      expect(isSystemPermitLocked('Polaris')).toBe(true);
      expect(isSystemPermitLocked('HIP 22460')).toBe(true);
      expect(isSystemPermitLocked('Sol', true)).toBe(true);
      expect(isSystemPermitLocked('HIP 12345')).toBe(false);
    });
  });

  describe('Primary Star Scoopability', () => {
    it('correctly classifies KGBFOAM stars as scoopable', () => {
      expect(isStarScoopable('K (Yellow-Orange) Star')).toBe(true);
      expect(isStarScoopable('G')).toBe(true);
      expect(isStarScoopable('B (Blue-White) Star')).toBe(true);
      expect(isStarScoopable('F')).toBe(true);
      expect(isStarScoopable('O')).toBe(true);
      expect(isStarScoopable('A')).toBe(true);
      expect(isStarScoopable('M (Red dwarf) Star')).toBe(true);

      // Non-scoopable
      expect(isStarScoopable('L (Brown dwarf) Star')).toBe(false);
      expect(isStarScoopable('T')).toBe(false);
      expect(isStarScoopable('Y')).toBe(false);
      expect(isStarScoopable('TTS')).toBe(false);
      expect(isStarScoopable('DA (White dwarf) Star')).toBe(false);
      expect(isStarScoopable('N (Neutron star)')).toBe(false);
      expect(isStarScoopable('H (Black Hole)')).toBe(false);
    });
  });

  describe('Full Infrastructure & Faction Validation', () => {
    it('Negative Test 1: Rejects population=0 system that contains an outpost/station', () => {
      const audit = validateSystemInfrastructure('Test System', {
        population: 0,
        stations: [{ name: 'Secret Automated Outpost', type: 'Outpost' }],
        controlling_faction: null,
      });

      expect(audit.isValid).toBe(false);
      expect(audit.hasPermanentStations).toBe(true);
      expect(audit.reasons.some((r) => r.includes('permanent station'))).toBe(true);
    });

    it('Negative Test 2: Rejects population=0 system that has a controlling faction or minor factions', () => {
      const audit = validateSystemInfrastructure('Border Sector', {
        population: 0,
        stations: [],
        controlling_faction: 'Expansionist Syndicate',
      });

      expect(audit.isValid).toBe(false);
      expect(audit.reasons.some((r) => r.includes('Controlling faction'))).toBe(true);
    });

    it('Negative Test 3: Rejects permit locked system even if 0 population and empty', () => {
      const audit = validateSystemInfrastructure('Col 70 Sector AA-A a1', {
        population: 0,
        stations: [],
      });

      expect(audit.isValid).toBe(false);
      expect(audit.isPermitLocked).toBe(true);
      expect(audit.reasons.some((r) => r.includes('permit locked'))).toBe(true);
    });

    it('Negative Test 4: Rejects system with active colonization ship / construction vessel', () => {
      const audit = validateSystemInfrastructure('HIP 99999', {
        population: 0,
        stations: [{ name: 'Pioneer Beacon Alpha', type: 'Colonisation Ship' }],
      });

      expect(audit.isValid).toBe(false);
      expect(audit.hasActiveColonizationShip).toBe(true);
    });

    it('Positive Edge Case: Accepts uncolonized system with player Fleet Carriers present (adds warning)', () => {
      const audit = validateSystemInfrastructure('HIP 11111', {
        population: 0,
        stations: [{ name: 'Deep Space Miner (X4T-99Q)', type: 'Drake-Class Carrier' }],
        controlling_faction: null,
        primary_star: 'G',
      });

      expect(audit.isValid).toBe(true);
      expect(audit.hasPermanentStations).toBe(false);
      expect(audit.warnings.some((w) => w.includes('Fleet Carrier'))).toBe(true);
    });

    it('Positive Test: Verified Clean candidate passes with flying colors', () => {
      const audit = validateSystemInfrastructure('HIP 22222', {
        population: 0,
        stations: [],
        controlling_faction: null,
        factions: [],
        government: 'None',
        allegiance: 'None',
        primary_star: 'K',
      });

      expect(audit.isValid).toBe(true);
      expect(audit.isVerifiedClean).toBe(true);
      expect(audit.reasons.length).toBe(0);
      expect(audit.primaryStarScoopable).toBe(true);
    });

    it('Negative Test 5: Rejects system explicitly marked as is_colonised: true', () => {
      const audit = validateSystemInfrastructure('Pristine Candidate', {
        population: 0,
        stations: [],
        is_colonised: true,
      });

      expect(audit.isValid).toBe(false);
      expect(audit.isColonised).toBe(true);
      expect(audit.reasons.some((r) => r.includes('Marked as colonised'))).toBe(true);
    });

    it('Negative Test 6: Rejects system with active colonisation in progress (is_being_colonised: true)', () => {
      const audit = validateSystemInfrastructure('Expanding Colony', {
        population: 0,
        stations: [],
        is_being_colonised: true,
      });

      expect(audit.isValid).toBe(false);
      expect(audit.isBeingColonised).toBe(true);
      expect(audit.reasons.some((r) => r.includes('Active colonisation in progress'))).toBe(true);
    });
  });

  describe('Celestial Bodies and Rings Criteria Evaluation', () => {
    const baseCriteria: ColonizeSearchCriteria = {
      referenceSystem: 'Sol',
      searchMode: 'single_sphere',
      maxDistanceLy: 15,
      requireLandable: true,
      minLandableCount: 1,
      requireRings: true,
      ringType: 'any',
      ringReserve: 'any',
    };

    it('passes when system has landable planets and rings', () => {
      const bodies = [
        { name: 'HIP 1 A', is_landable: true, distance_to_arrival: 450 },
        {
          name: 'HIP 1 1',
          is_landable: false,
          rings: [{ name: 'Ring A', type: 'Metallic', reserve_level: 'Pristine' }],
        },
      ];

      const res = extractAndValidateBodies(bodies, baseCriteria);
      expect(res.passesCriteria).toBe(true);
      expect(res.bodySummary.landableCount).toBe(1);
      expect(res.bodySummary.rings.length).toBe(1);
      expect(res.bodySummary.hasPristineMetallic).toBe(true);
    });

    it('fails when system lacks landable planets', () => {
      const bodies = [
        {
          name: 'HIP 1 1',
          is_landable: false,
          rings: [{ name: 'Ring A', type: 'Icy', reserve_level: 'Common' }],
        },
      ];

      const res = extractAndValidateBodies(bodies, baseCriteria);
      expect(res.passesCriteria).toBe(false);
      expect(res.failureReason).toContain('landable');
    });

    it('enforces specific ring type and reserve filters', () => {
      const bodies = [
        { name: 'HIP 1 A', is_landable: true },
        {
          name: 'HIP 1 1',
          rings: [{ name: 'Ring A', type: 'Icy', reserve_level: 'Common' }],
        },
      ];
      const strictCriteria: ColonizeSearchCriteria = {
        ...baseCriteria,
        ringType: 'Metallic',
        ringReserve: 'Pristine',
      };

      const res = extractAndValidateBodies(bodies, strictCriteria);
      expect(res.passesCriteria).toBe(false);
      expect(res.failureReason).toContain('Metallic');
    });

    it('enforces Black Hole requirement: passes when Black Hole present', () => {
      const bodies = [
        { name: 'HIP 63835 A', sub_type: 'Black Hole', type: 'Star', distance_to_arrival: 0 },
        { name: 'HIP 63835 B', sub_type: 'Black Hole', type: 'Star', distance_to_arrival: 1200 },
        { name: 'HIP 63835 1', is_landable: true, sub_type: 'High metal content world' },
      ];

      const bhCriteria: ColonizeSearchCriteria = {
        ...baseCriteria,
        requireBlackHole: true,
        requireRings: false,
      };

      const res = extractAndValidateBodies(bodies, bhCriteria);
      expect(res.passesCriteria).toBe(true);
      expect(res.bodySummary.hasBlackHole).toBe(true);
      expect(res.bodySummary.blackHoleCount).toBe(2);
    });

    it('enforces Black Hole requirement: fails when no Black Hole present in system', () => {
      const bodies = [
        { name: 'Sol A', sub_type: 'G (White-Yellow) Star', type: 'Star' },
        { name: 'Sol 3', is_landable: false, sub_type: 'Earth-like world' },
        { name: 'Sol 4', is_landable: true, sub_type: 'High metal content world' },
      ];

      const bhCriteria: ColonizeSearchCriteria = {
        ...baseCriteria,
        requireBlackHole: true,
        requireRings: false,
      };

      const res = extractAndValidateBodies(bodies, bhCriteria);
      expect(res.passesCriteria).toBe(false);
      expect(res.bodySummary.hasBlackHole).toBe(false);
      expect(res.bodySummary.blackHoleCount).toBe(0);
      expect(res.failureReason).toContain('Black Hole');
    });
  });
});
