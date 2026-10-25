import type {
  ColonizeSearchCriteria,
  ColonizeCandidate,
  ClaimHubDetail,
  PipelineProgressEvent,
  PipelineMatchEvent,
  Coordinates,
} from './types';
import {
  validateSystemInfrastructure,
  extractAndValidateBodies,
} from './validator';
import {
  searchSpanshSystems,
  getSpanshSystemCoords,
  getSpanshSystemDetails,
  findClosestClaimHub,
} from './sources/spansh';
import {
  getEdsmSystemStations,
  getEdsmSystemFactions,
  getEdsmSystemBodies,
  getEdsmSystemCoordinates,
  getEdsmSystemInfo,
} from './sources/edsm';
import { getCurrentSystemFromJournal } from './journal';

/**
 * Calculates Euclidean distance between two 3D coordinates.
 */
export function calculateDistance(p1: Coordinates, p2: Coordinates): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = p1.z - p2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Resolves 3D galactic coordinates for a given star system name.
 */
export async function resolveSystemCoordinates(
  systemName: string,
  onLog?: (msg: string) => void
): Promise<Coordinates | null> {
  const cleanName = systemName.trim();
  if (onLog) onLog(`Resolving coordinates for "${cleanName}"...`);

  // 1. Check local Journal
  const journalInfo = getCurrentSystemFromJournal();
  if (
    journalInfo &&
    journalInfo.coords &&
    journalInfo.systemName.toLowerCase() === cleanName.toLowerCase()
  ) {
    if (onLog) onLog(`Found coordinates in live player Journal: [${journalInfo.coords.x}, ${journalInfo.coords.y}, ${journalInfo.coords.z}]`);
    return journalInfo.coords;
  }

  // 2. Query EDSM first (fast, direct, synchronous endpoint with coordsLocked)
  const edsmCoords = await getEdsmSystemCoordinates(cleanName);
  if (edsmCoords) {
    if (onLog) onLog(`Found coordinates via EDSM: [${edsmCoords.x}, ${edsmCoords.y}, ${edsmCoords.z}]`);
    return edsmCoords;
  }

  // 3. Query Spansh as fallback
  const spanshCoords = await getSpanshSystemCoords(cleanName);
  if (spanshCoords) {
    if (onLog) onLog(`Found coordinates via Spansh: [${spanshCoords.x}, ${spanshCoords.y}, ${spanshCoords.z}]`);
    return spanshCoords;
  }

  return null;
}

/**
 * Executes the complete multi-source, multi-stage Colonisation Search Pipeline.
 * Automates searching Spansh for uncolonized systems and inspecting bodies one by one.
 */
export async function runColonizePipeline(
  criteria: ColonizeSearchCriteria,
  onProgress?: (event: PipelineProgressEvent) => void,
  onMatch?: (event: PipelineMatchEvent) => void
): Promise<ColonizeCandidate[]> {
  const matches: ColonizeCandidate[] = [];
  const visitedSystemNames = new Set<string>();

  const emitProgress = (event: PipelineProgressEvent) => {
    if (onProgress) onProgress(event);
  };

  const emitMatch = (candidate: ColonizeCandidate) => {
    matches.push(candidate);
    if (onMatch) onMatch({ type: 'colonize_match', system: candidate });
  };

  emitProgress({
    type: 'colonize_progress',
    stage: 'locating_reference',
    message: `Locating reference system "${criteria.referenceSystem}"...`,
    logType: 'info',
  });

  // Step 0: Resolve reference system coordinates
  let refCoords: Coordinates | null = criteria.referenceCoords || null;
  if (!refCoords) {
    refCoords = await resolveSystemCoordinates(criteria.referenceSystem, (msg) => {
      emitProgress({
        type: 'colonize_progress',
        stage: 'locating_reference',
        message: msg,
        logType: 'info',
      });
    });
  }

  if (!refCoords) {
    const errorMsg = `Could not resolve galactic coordinates for "${criteria.referenceSystem}". Please verify spelling (e.g., HIP 26722, Sol, Shinrarta Dezhra).`;
    emitProgress({
      type: 'colonize_progress',
      stage: 'error',
      message: errorMsg,
      logType: 'error',
    });
    throw new Error(errorMsg);
  }

  emitProgress({
    type: 'colonize_progress',
    stage: 'locating_reference',
    message: `Reference coordinates locked: [${refCoords.x.toFixed(1)}, ${refCoords.y.toFixed(1)}, ${refCoords.z.toFixed(1)}]`,
    logType: 'info',
  });

  const stepLy = criteria.shellStepLy ?? 15;
  const maxLy = criteria.maxDistanceLy;

  // Determine search ranges (shells or single sphere)
  const searchRanges: Array<{ min: number; max: number; label: string }> = [];

  if (criteria.searchMode === 'concentric_shells') {
    let currentMin = 0;
    while (currentMin < maxLy) {
      const currentMax = Math.min(maxLy, currentMin + stepLy);
      searchRanges.push({
        min: currentMin,
        max: currentMax,
        label: `${currentMin} – ${currentMax} LY`,
      });
      currentMin = currentMax;
    }
  } else {
    // Single sphere mode (or directional ray)
    searchRanges.push({
      min: 0,
      max: maxLy,
      label: `0 – ${maxLy} LY`,
    });
  }

  const totalShells = searchRanges.length;
  const maxCandidatesToAudit = criteria.maxAuditedSystems && criteria.maxAuditedSystems > 0
    ? criteria.maxAuditedSystems
    : 100; // Default 100 audited systems
  let totalAudited = 0;

  for (let sIndex = 0; sIndex < searchRanges.length; sIndex++) {
    const range = searchRanges[sIndex];

    const bodyCountFilter = criteria.requireLandable || criteria.requireBlackHole
      ? {
          bodyCountMin: 2,
          bodyCountMax: 1000,
          requirePlanets: criteria.requireLandable,
          requireBlackHole: criteria.requireBlackHole,
        }
      : undefined;

    const filterNotes: string[] = [];
    if (criteria.requireLandable) filterNotes.push('planets required');
    if (criteria.requireBlackHole) filterNotes.push('black holes required');
    const filterNote = filterNotes.length > 0 ? ` (${filterNotes.join(', ')})` : '';

    emitProgress({
      type: 'colonize_progress',
      stage: 'scanning_shell',
      message: `Step 1: Querying Spansh for uncolonized systems in ${range.label}${filterNote}...`,
      logType: 'info',
      currentShell: sIndex + 1,
      totalShells,
      distanceMin: range.min,
      distanceMax: range.max,
    });

    // Query Spansh (supports pagination up to 2 pages if needed)
    let page = 0;
    let hasMorePages = true;

    while (hasMorePages && totalAudited < maxCandidatesToAudit) {
      let spanshResponse: { total: number; results: any[] };

      try {
        spanshResponse = await searchSpanshSystems(
          refCoords,
          range.min,
          range.max,
          page,
          20,
          (msg) => {
            emitProgress({
              type: 'colonize_progress',
              stage: 'scanning_shell',
              message: msg,
              logType: 'info',
              currentShell: sIndex + 1,
              totalShells,
            });
          },
          bodyCountFilter
        );
      } catch (err: any) {
        console.warn(`[Pipeline] Spansh query error:`, err);
        emitProgress({
          type: 'colonize_progress',
          stage: 'error',
          message: `Spansh query failed: ${err.message}`,
          logType: 'error',
        });
        break;
      }

      const rawCandidates = spanshResponse.results;
      if (rawCandidates.length === 0) {
        emitProgress({
          type: 'colonize_progress',
          stage: 'scanning_shell',
          message: `Spansh returned 0 systems in range ${range.label}.`,
          logType: 'info',
          currentShell: sIndex + 1,
          totalShells,
        });
        break;
      }

      emitProgress({
        type: 'colonize_progress',
        stage: 'evaluating_bodies',
        message: `Step 1 Complete: Spansh returned ${rawCandidates.length} candidate systems (total database count: ${spanshResponse.total}). Auditing bodies one by one...`,
        logType: 'info',
        currentShell: sIndex + 1,
        totalShells,
        candidatesFound: rawCandidates.length,
        totalCandidates: rawCandidates.length,
      });

      // Step 2: Automated inspection of candidate systems one by one
      for (let cIndex = 0; cIndex < rawCandidates.length; cIndex++) {
        if (totalAudited >= maxCandidatesToAudit) {
          hasMorePages = false;
          break;
        }
        totalAudited++;
        const raw = rawCandidates[cIndex];
        const systemName = raw.name;
        const distLy = Math.round(raw.distance * 100) / 100;

        if (visitedSystemNames.has(systemName.toLowerCase())) continue;
        visitedSystemNames.add(systemName.toLowerCase());

        emitProgress({
          type: 'colonize_progress',
          stage: 'validating_infrastructure',
          message: `[${totalAudited}] Inspecting ${systemName} (+${distLy} LY)...`,
          logType: 'info',
          currentShell: sIndex + 1,
          totalShells,
          validatedCount: totalAudited,
          totalCandidates: maxCandidatesToAudit,
        });

        // 1. First-pass infrastructure audit (stations, population, permits)
        const audit = validateSystemInfrastructure(systemName, raw);
        if (!audit.isValid) {
          emitProgress({
            type: 'colonize_progress',
            stage: 'validating_infrastructure',
            message: `[${systemName}] Skipped: ${audit.reasons.join(', ')}`,
            logType: 'skip',
            currentShell: sIndex + 1,
            totalShells,
          });
          continue;
        }

        // 2. Fetch bodies from EDSM or Spansh
        // Note: Spansh /api/system/{id64} is a lightweight summary that omits surface scan data (is_landable, rings).
        // Therefore, we query EDSM first when landables, rings, or valuable worlds are required.
        let bodies: any[] = [];
        try {
          if (criteria.requireLandable || criteria.requireRings || criteria.requireValuableWorld) {
            bodies = await getEdsmSystemBodies(systemName);
          }

          if (!bodies || bodies.length === 0) {
            const details = await getSpanshSystemDetails(raw.id64);
            const rawBodies = details?.record?.bodies || details?.bodies;
            if (rawBodies && rawBodies.length > 0) {
              bodies = rawBodies;
            }
          }

          // Fallback: if bodies came from Spansh details but lack landability info while requireLandable is on, query EDSM
          if (
            criteria.requireLandable &&
            (!bodies || bodies.length === 0 || !bodies.some((b) => b.is_landable || b.isLandable || b.landable))
          ) {
            const edsmBodies = await getEdsmSystemBodies(systemName);
            if (edsmBodies && edsmBodies.length > 0) {
              bodies = edsmBodies;
            }
          }
        } catch (err) {
          console.warn(`[Pipeline] Failed to fetch bodies for ${systemName}:`, err);
          bodies = await getEdsmSystemBodies(systemName);
        }

        // 3. Evaluate Landables and Rings
        const bodyEval = extractAndValidateBodies(bodies, criteria);
        if (!bodyEval.passesCriteria) {
          emitProgress({
            type: 'colonize_progress',
            stage: 'evaluating_bodies',
            message: `[${systemName}] (+${distLy} LY): ${bodyEval.failureReason || 'Failed body criteria'} -> Skipped`,
            logType: 'skip',
            currentShell: sIndex + 1,
            totalShells,
          });
          continue;
        }

        // 4. Scoopable primary star check
        if (criteria.requireScoopablePrimary && !audit.primaryStarScoopable) {
          emitProgress({
            type: 'colonize_progress',
            stage: 'evaluating_bodies',
            message: `[${systemName}]: Primary star (${raw.primary_star}) is not scoopable -> Skipped`,
            logType: 'skip',
            currentShell: sIndex + 1,
            totalShells,
          });
          continue;
        }

        // 5. Cross-API Reconciliation with EDSM & Timestamp Freshness Comparison
        let spanshUpdatedAt = raw.updated_at || null;
        let edsmUpdatedAt: string | null = null;
        let freshestSource: 'spansh' | 'edsm' | 'equal' = 'equal';
        let freshestTimestamp: string = spanshUpdatedAt || 'Unknown';

        if (criteria.validateWithEdsm) {
          try {
            const [edsmStations, edsmFactions, edsmInfo] = await Promise.all([
              getEdsmSystemStations(systemName),
              getEdsmSystemFactions(systemName),
              getEdsmSystemInfo(systemName),
            ]);

            // Determine latest update timestamp from EDSM stations
            if (edsmStations && edsmStations.length > 0) {
              for (const st of edsmStations) {
                if (st.updateTime?.information) {
                  if (!edsmUpdatedAt || st.updateTime.information > edsmUpdatedAt) {
                    edsmUpdatedAt = st.updateTime.information;
                  }
                }
              }
            }

            // Compare timestamps between Spansh and EDSM
            const spTime = spanshUpdatedAt ? new Date(spanshUpdatedAt).getTime() : 0;
            const edTime = edsmUpdatedAt ? new Date(edsmUpdatedAt.replace(' ', 'T') + 'Z').getTime() : 0;

            if (spTime > edTime && spTime > 0) {
              freshestSource = 'spansh';
              freshestTimestamp = spanshUpdatedAt!;
            } else if (edTime > spTime && edTime > 0) {
              freshestSource = 'edsm';
              freshestTimestamp = edsmUpdatedAt!;
            } else if (spTime > 0) {
              freshestSource = 'equal';
              freshestTimestamp = spanshUpdatedAt!;
            }

            const edsmAudit = validateSystemInfrastructure(systemName, {
              stations: edsmStations,
              factions: edsmFactions,
              population: edsmInfo?.information?.population,
              government: edsmInfo?.information?.government,
              allegiance: edsmInfo?.information?.allegiance,
            });

            if (!edsmAudit.isValid) {
              emitProgress({
                type: 'colonize_progress',
                stage: 'validating_infrastructure',
                message: `[${systemName}]: EDSM cross-check caught infrastructure (${edsmAudit.reasons.join(', ')}) [Freshest: ${freshestSource.toUpperCase()} ${freshestTimestamp}] -> Disqualified`,
                logType: 'skip',
                currentShell: sIndex + 1,
                totalShells,
              });
              continue;
            }

            audit.crossChecked = true;
            audit.isVerifiedClean = true;
            audit.spanshUpdatedAt = spanshUpdatedAt || undefined;
            audit.edsmUpdatedAt = edsmUpdatedAt || undefined;
            audit.freshestSource = freshestSource;
            audit.freshestTimestamp = freshestTimestamp;
            audit.freshnessSummary = `Spansh: ${spanshUpdatedAt ? spanshUpdatedAt.split('T')[0] : 'N/A'} | EDSM: ${edsmUpdatedAt ? edsmUpdatedAt.split(' ')[0] : 'N/A'} (Freshest: ${freshestSource.toUpperCase()})`;
          } catch (err) {
            console.warn(`[Pipeline] EDSM cross-check error for ${systemName}:`, err);
            audit.crossChecked = false;
          }
        } else if (spanshUpdatedAt) {
          audit.spanshUpdatedAt = spanshUpdatedAt;
          audit.freshestSource = 'spansh';
          audit.freshestTimestamp = spanshUpdatedAt;
          audit.freshnessSummary = `Spansh: ${spanshUpdatedAt.split('T')[0]}`;
        }

        // CANDIDATE VERIFIED!
        const ringsDesc = bodyEval.bodySummary.rings.length > 0
          ? `${bodyEval.bodySummary.rings.length} ring(s)`
          : 'no rings';
        emitProgress({
          type: 'colonize_progress',
          stage: 'validating_infrastructure',
          message: `⭐ [${systemName}] MATCH VERIFIED! (+${distLy} LY) — ${bodyEval.bodySummary.landableCount} landable(s), ${ringsDesc}`,
          logType: 'match',
          currentShell: sIndex + 1,
          totalShells,
        });

        // Resolve closest colonized claim hub within 15 LY for beacon claim
        let claimHub: ClaimHubDetail | null = null;
        try {
          claimHub = await findClosestClaimHub(raw.coords);
          if (claimHub) {
            emitProgress({
              type: 'colonize_progress',
              stage: 'validating_infrastructure',
              message: `[${systemName}]: Nearest Claim Hub -> ${claimHub.systemName} (+${claimHub.distanceLy} LY) | ${claimHub.stationName} (${claimHub.stationType})`,
              logType: 'info',
              currentShell: sIndex + 1,
              totalShells,
            });
          } else {
            emitProgress({
              type: 'colonize_progress',
              stage: 'validating_infrastructure',
              message: `[${systemName}]: Note: No populated orbital hub found within 15 LY (exceeds direct claim beacon range)`,
              logType: 'info',
              currentShell: sIndex + 1,
              totalShells,
            });
          }
        } catch (hubErr) {
          console.warn(`[Pipeline] Failed to resolve claim hub for ${systemName}:`, hubErr);
        }

        const candidate: ColonizeCandidate = {
          id64: raw.id64,
          name: systemName,
          coords: raw.coords,
          distanceLy: distLy,
          primaryStar: raw.primary_star,
          isPrimaryStarScoopable: audit.primaryStarScoopable,
          bodySummary: bodyEval.bodySummary,
          hasBlackHole: bodyEval.bodySummary.hasBlackHole,
          closestClaimHub: claimHub,
          audit,
          links: {
            inaraUrl: `https://inara.cz/elite/starsystem/?search=${encodeURIComponent(systemName)}`,
            spanshUrl: `https://spansh.co.uk/system/${raw.id64}`,
            edsmUrl: `https://www.edsm.net/en/system/id/${raw.id64}/name/${encodeURIComponent(systemName)}`,
          },
        };

        emitMatch(candidate);

        // If we found enough matches (e.g., 10 matches), stop early
        if (matches.length >= 10) break;
      }

      page++;
      const maxPages = Math.ceil(maxCandidatesToAudit / 20);
      // Stop pagination if we got fewer results than page size, reached target matches, or reached audit limit
      if (rawCandidates.length < 20 || matches.length >= 10 || totalAudited >= maxCandidatesToAudit || page >= maxPages) {
        hasMorePages = false;
      }
    }
  }

  emitProgress({
    type: 'colonize_progress',
    stage: 'complete',
    message: `Scout complete! Audited ${totalAudited} candidate system(s). Found ${matches.length} verified colonizable match(es).`,
    logType: 'info',
  });

  return matches;
}
