import { readdirSync, readFileSync, statSync, existsSync } from 'fs';
import { join } from 'path';
import type { Coordinates } from './types';

// Standard Elite Dangerous journal log directory on Windows
const DEFAULT_JOURNAL_DIR = 'C:\\Users\\fary2\\Saved Games\\Frontier Developments\\Elite Dangerous';

export interface CurrentSystemTelemetry {
  systemName: string;
  coords?: Coordinates;
  bodyName?: string;
  timestamp?: string;
  isDocked?: boolean;
}

/**
 * Finds the latest journal file in the Elite Dangerous journal directory.
 */
export function getLatestJournalPath(journalDir: string = DEFAULT_JOURNAL_DIR): string | null {
  try {
    if (!existsSync(journalDir)) return null;

    const files = readdirSync(journalDir);
    const journalFiles = files.filter(
      (f) => f.startsWith('Journal.') && f.endsWith('.log')
    );

    if (journalFiles.length === 0) return null;

    // Sort by modification time descending, tie-breaking by filename descending
    journalFiles.sort((a, b) => {
      const statA = statSync(join(journalDir, a));
      const statB = statSync(join(journalDir, b));
      const diff = statB.mtimeMs - statA.mtimeMs;
      if (diff !== 0) return diff;
      return b.localeCompare(a);
    });

    return join(journalDir, journalFiles[0]);
  } catch (err) {
    console.warn('[JournalReader] Could not read journal directory:', err);
    return null;
  }
}

/**
 * Reads the latest star system from the active player journal log.
 */
export function getCurrentSystemFromJournal(journalDir: string = DEFAULT_JOURNAL_DIR): CurrentSystemTelemetry | null {
  const latestPath = getLatestJournalPath(journalDir);
  if (!latestPath) return null;

  try {
    const content = readFileSync(latestPath, 'utf-8');
    const lines = content.split(/\r?\n/).filter(Boolean);

    // Read lines backwards to find the most recent location/jump event
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const event = JSON.parse(lines[i]);
        if (
          event.event === 'FSDJump' ||
          event.event === 'Location' ||
          event.event === 'CarrierJump'
        ) {
          const coords: Coordinates | undefined = Array.isArray(event.StarPos) && event.StarPos.length === 3
            ? { x: event.StarPos[0], y: event.StarPos[1], z: event.StarPos[2] }
            : undefined;

          return {
            systemName: event.StarSystem,
            coords,
            bodyName: event.Body,
            timestamp: event.timestamp,
            isDocked: Boolean(event.Docked),
          };
        }
      } catch {
        // Skip malformed lines
      }
    }
    return null;
  } catch (err) {
    console.warn('[JournalReader] Error reading journal file:', err);
    return null;
  }
}

export interface CommanderTelemetry {
  commanderName?: string;
  fid?: string;
  credits?: number;
  loan?: number;
  ship?: string;
  shipName?: string;
  shipIdent?: string;
  gameMode?: string;
  ranks?: Record<string, number>;
  timestamp?: string;
  journalFile?: string;
}

/**
 * Extracts Commander profile and status from the active player journal log.
 */
export function getCommanderFromJournal(journalDir: string = DEFAULT_JOURNAL_DIR): CommanderTelemetry | null {
  const latestPath = getLatestJournalPath(journalDir);
  if (!latestPath) return null;

  try {
    const content = readFileSync(latestPath, 'utf-8');
    const lines = content.split(/\r?\n/).filter(Boolean);
    const result: CommanderTelemetry = {
      journalFile: latestPath.split('\\').pop() ?? latestPath.split('/').pop(),
    };

    // Scan backwards to find the most recent Commander / LoadGame / Rank / Ship events
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const event = JSON.parse(lines[i]);

        if (!result.commanderName && (event.event === 'Commander' || event.event === 'LoadGame')) {
          result.commanderName = event.Name || event.Commander;
          result.fid = event.FID;
          if (event.Credits !== undefined) result.credits = event.Credits;
          if (event.Loan !== undefined) result.loan = event.Loan;
          if (event.Ship) result.ship = event.Ship;
          if (event.ShipName) result.shipName = event.ShipName;
          if (event.ShipIdent) result.shipIdent = event.ShipIdent;
          if (event.GameMode) result.gameMode = event.GameMode;
          result.timestamp = event.timestamp;
        }

        if (!result.ranks && event.event === 'Rank') {
          result.ranks = {
            Combat: event.Combat,
            Trade: event.Trade,
            Explore: event.Explore,
            Soldier: event.Soldier,
            Exobiologist: event.Exobiologist,
            Empire: event.Empire,
            Federation: event.Federation,
            CQC: event.CQC,
          };
        }

        // Break early if we have both commander info and ranks
        if (result.commanderName && result.ranks) break;
      } catch {
        // Skip malformed lines
      }
    }

    return result.commanderName ? result : null;
  } catch (err) {
    console.warn('[JournalReader] Error extracting commander info:', err);
    return null;
  }
}
