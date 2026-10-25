import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { getCommanderFromJournal } from './journal';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'fs';
import { join } from 'path';

describe('Journal Commander Extraction & Settings Integrations', () => {
  const testDir = join(import.meta.dir, 'test_journal_logs');

  beforeEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('correctly extracts Commander name, FID, Credits, Ship, and Ranks from journal file', () => {
    const mockJournalPath = join(testDir, 'Journal.2026-10-25T180000.01.log');
    const mockEvents = [
      JSON.stringify({
        timestamp: '2026-10-25T18:00:00Z',
        event: 'Fileheader',
        part: 1,
        language: 'English',
        Odyssey: true,
        gameversion: '4.0.0.1900',
        build: 'r304521'
      }),
      JSON.stringify({
        timestamp: '2026-10-25T18:00:05Z',
        event: 'Commander',
        FID: 'F9876543',
        Name: 'Farlander'
      }),
      JSON.stringify({
        timestamp: '2026-10-25T18:00:06Z',
        event: 'Rank',
        Combat: 4,
        Trade: 8,
        Explore: 9,
        Soldier: 3,
        Exobiologist: 5,
        Empire: 12,
        Federation: 14,
        CQC: 0
      }),
      JSON.stringify({
        timestamp: '2026-10-25T18:00:08Z',
        event: 'LoadGame',
        FID: 'F9876543',
        Commander: 'Farlander',
        Credits: 450200100,
        Loan: 0,
        Ship: 'Anaconda',
        ShipName: 'VOYAGER VII',
        ShipIdent: 'FAR-01',
        GameMode: 'Open'
      }),
      JSON.stringify({
        timestamp: '2026-10-25T18:05:00Z',
        event: 'Location',
        StarSystem: 'Shinrarta Dezhra',
        StarPos: [55.71875, 17.59375, 27.15625],
        Body: 'Jameson Memorial',
        Docked: true
      })
    ].join('\n');

    writeFileSync(mockJournalPath, mockEvents, 'utf-8');

    const cmdr = getCommanderFromJournal(testDir);
    expect(cmdr).not.toBeNull();
    expect(cmdr?.commanderName).toBe('Farlander');
    expect(cmdr?.fid).toBe('F9876543');
    expect(cmdr?.credits).toBe(450200100);
    expect(cmdr?.ship).toBe('Anaconda');
    expect(cmdr?.shipName).toBe('VOYAGER VII');
    expect(cmdr?.shipIdent).toBe('FAR-01');
    expect(cmdr?.gameMode).toBe('Open');
    expect(cmdr?.ranks?.Combat).toBe(4);
    expect(cmdr?.ranks?.Explore).toBe(9);
  });

  it('returns null gracefully when journal directory is empty', () => {
    const cmdr = getCommanderFromJournal(testDir);
    expect(cmdr).toBeNull();
  });

  it('picks the newest journal file when multiple exist', () => {
    const olderFile = join(testDir, 'Journal.2026-10-20T100000.01.log');
    const newerFile = join(testDir, 'Journal.2026-10-25T180000.01.log');

    writeFileSync(olderFile, JSON.stringify({ timestamp: '2026-10-20T10:00:00Z', event: 'Commander', Name: 'OldPilot' }), 'utf-8');
    writeFileSync(newerFile, JSON.stringify({ timestamp: '2026-10-25T18:00:00Z', event: 'Commander', Name: 'ActivePilot' }), 'utf-8');

    const cmdr = getCommanderFromJournal(testDir);
    expect(cmdr).not.toBeNull();
    expect(cmdr?.commanderName).toBe('ActivePilot');
  });
});
