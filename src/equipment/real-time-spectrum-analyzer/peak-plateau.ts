/**
 * Peak Search's pick rule, shared by `RealTimeSpectrumAnalyzer.peakSearch` and
 * the in-plot marker (`SpectralDensityPlot.updateTopMarkers`) so the readout,
 * the marker and the Ops Log line agree (phase 32 D11, r7-s12-F1, r7-s15-F1).
 */

/**
 * Bins less than this far below the trace maximum count as one flat top, so a
 * noisy 36 MHz carrier top reads at its centre instead of its noisiest bin
 */
export const PEAK_PLATEAU_DB = 0.5;

/** The peak of a trace: the bin Peak Search reads and the run it sits in */
export interface PeakPlateau {
  /** The bin Peak Search reads: the centre of the run (left of centre for an even run) */
  bin: number;
  /** The highest finite level in the trace, dBm */
  maxDbm: number;
  /** First bin of the contiguous run within PEAK_PLATEAU_DB of maxDbm */
  start: number;
  /** Last bin of that run */
  end: number;
}

/** A tracking marker's held pick: its bin and the trace maximum when it was picked */
export interface PeakHold {
  bin: number;
  maxDbm: number;
}

/**
 * The highest point of `data[0..length)`, wherever it sits relative to the
 * amplitude window, as the centre of the contiguous run of bins within
 * PEAK_PLATEAU_DB of the maximum. Null when no bin is finite.
 */
export function findPeakPlateau(data: ArrayLike<number>, length: number = data.length): PeakPlateau | null {
  const n = Math.min(length, data.length);
  let best = -1;
  for (let x = 0; x < n; x++) {
    if (Number.isFinite(data[x]) && (best < 0 || data[x] > data[best])) {
      best = x;
    }
  }
  if (best < 0) {
    return null;
  }
  const maxDbm = data[best];
  const floor = maxDbm - PEAK_PLATEAU_DB;
  let start = best;
  while (start > 0 && data[start - 1] > floor) {
    start--;
  }
  let end = best;
  while (end + 1 < n && data[end + 1] > floor) {
    end++;
  }

  return { bin: start + Math.floor((end - start) / 2), maxDbm, start, end };
}

/**
 * The pick for a tracking marker: it keeps `held` while the trace maximum is
 * within PEAK_PLATEAU_DB of the maximum at pick time and the held bin is still
 * within PEAK_PLATEAU_DB of the maximum (still on the flat top); otherwise a
 * fresh `findPeakPlateau` pick. A held result keeps the pick-time maxDbm as its
 * reference, so slow drift past 0.5 dB still re-picks.
 */
export function holdPeakPlateau(data: ArrayLike<number>, length: number, held: PeakHold | null | undefined): PeakPlateau | null {
  const fresh = findPeakPlateau(data, length);
  if (!fresh || !held || held.bin < 0 || held.bin >= Math.min(length, data.length)) {
    return fresh;
  }
  const isMaxSteady = Math.abs(fresh.maxDbm - held.maxDbm) <= PEAK_PLATEAU_DB;
  const isStillOnTop = data[held.bin] > fresh.maxDbm - PEAK_PLATEAU_DB;
  if (isMaxSteady && isStillOnTop) {
    return { ...fresh, bin: held.bin, maxDbm: held.maxDbm };
  }

  return fresh;
}
