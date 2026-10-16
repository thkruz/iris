import { describe, expect, it } from 'vitest';
import type { IQSignalInfo } from '../../../src/equipment/receiver/receiver';
import { describePayloadProblem, rxModemVerdict } from '../../../src/equipment/receiver/rx-signal-quality';

/** A locked carrier with 10 dB of margin, overridable per case */
function info(overrides: Partial<IQSignalInfo> = {}): IQSignalInfo {
  return {
    hasCarrier: true,
    hasLock: true,
    cnRatio_dB: 15,
    effectiveCnRatio_dB: 15,
    effectiveEsN0_dB: 15,
    requiredEsN0_dB: 5.03,
    ...overrides,
  } as IQSignalInfo;
}

describe('rxModemVerdict (Phase 33 D4)', () => {
  it('is green with no alarm at a good margin, interferer or not', () => {
    for (const interferenceCount of [0, 2]) {
      const verdict = rxModemVerdict(info({ interferenceCount }), null);
      expect(verdict).toEqual({
        grade: 'good',
        badgeClass: 'status-badge-good',
        badgeText: 'Good',
        statusText: 'Signal locked - Good margin (Es/N0 15.0 dB, need 5.0 dB)',
        severity: 'success',
        alarmMessage: null,
      });
    }
  });

  it('turns badge, status and LED amber together for a payload problem at a good margin', () => {
    const verdict = rxModemVerdict(info(), 'Frame sync lost');
    expect(verdict.grade).toBe('good');
    expect(verdict.badgeClass).toBe('status-badge-degraded');
    expect(verdict.badgeText).toBe('Degraded');
    expect(verdict.statusText).toBe('Signal locked - Frame sync lost (Es/N0 15.0 dB, need 5.0 dB)');
    expect(verdict.severity).toBe('warning');
    expect(verdict.alarmMessage).toBe('Frame sync lost');
  });

  it('names in-band interferers inside the degraded-margin line', () => {
    const verdict = rxModemVerdict(info({ isLowMargin: true, effectiveEsN0_dB: 5.6, interferenceCount: 1 }), null);
    expect(verdict.badgeText).toBe('Degraded');
    expect(verdict.severity).toBe('warning');
    expect(verdict.alarmMessage).toBe('Degraded margin (Es/N0 5.6 dB, need 5.0 dB) - 1 interferer(s) in band');
    expect(verdict.statusText).toBe('Signal locked - Degraded margin (Es/N0 5.6 dB, need 5.0 dB) - 1 interferer(s) in band');
  });

  it('leaves the degraded-margin line plain with no interferer', () => {
    expect(rxModemVerdict(info({ isLowMargin: true, effectiveEsN0_dB: 5.6 }), null).alarmMessage).toBe('Degraded margin (Es/N0 5.6 dB, need 5.0 dB)');
  });

  it('keeps the unlocked grades as before', () => {
    const acquiring = rxModemVerdict(info({ hasLock: false, lockState: 'acquiring', effectiveEsN0_dB: 5.9 }), 'Frame sync lost');
    expect(acquiring).toMatchObject({ badgeText: 'Acquiring', severity: 'info', statusText: 'Acquiring lock (Es/N0 5.9 dB, locks at 5.5 dB)' });

    const mismatch = rxModemVerdict(info({ hasLock: false, formatMismatch: true, effectiveCnRatio_dB: 13.7 }), null);
    expect(mismatch).toMatchObject({ badgeText: 'Mismatch', badgeClass: 'status-badge-error', severity: 'error', alarmMessage: 'No lock: format mismatch (modulation/FEC)' });
    expect(mismatch.statusText).toContain('C/N: 13.7 dB');

    const clipped = rxModemVerdict(info({ hasLock: false, isBandwidthClipped: true }), null);
    expect(clipped).toMatchObject({ badgeText: 'Clipped', severity: 'error' });

    const below = rxModemVerdict(info({ hasLock: false, lockState: 'unlocked', effectiveEsN0_dB: 5.2 }), null);
    expect(below).toMatchObject({ badgeText: 'No Lock', severity: 'error', statusText: 'Signal no lock - Below threshold (Es/N0 5.2 dB, locks at 5.5 dB)' });
  });
});

describe('describePayloadProblem', () => {
  it('ignores the FEC Degraded status (the margin grade shows it)', () => {
    expect(describePayloadProblem({ frameSyncLocked: true, rsUncorrectableBlocks: 0, channelStatus: 'Degraded' })).toBeNull();
    expect(describePayloadProblem({ frameSyncLocked: true, rsUncorrectableBlocks: 0, channelStatus: 'Good' })).toBeNull();
    expect(describePayloadProblem(null)).toBeNull();
  });

  it('keeps frame-sync loss, RS failure and Critical', () => {
    expect(describePayloadProblem({ frameSyncLocked: false, rsUncorrectableBlocks: 0, channelStatus: 'No Lock' })).toBe('Frame sync lost');
    expect(describePayloadProblem({ frameSyncLocked: true, rsUncorrectableBlocks: 4, channelStatus: 'Critical' })).toBe('RS overload');
    expect(describePayloadProblem({ frameSyncLocked: true, rsUncorrectableBlocks: 0, channelStatus: 'Critical' })).toBe('Payload errors');
  });
});
