/**
 * @file dialog-tokens - Author tokens filled in when a dialog is shown
 * @description A notice header that names a clock time ("[Regulator coordination
 * desk - SYSTEM notification, 10:41]") read five minutes in the future whenever
 * the player got there sooner than the author guessed (nats-r4-s21-F1). Authors
 * write `{{stationTime}}` instead, and the dialog shows the station clock at the
 * moment it opens.
 */

import { getSimulatedNowMs } from '@app/simulation/sim-time';

/** Author token for the station clock (UTC, HH:MM) at the moment the dialog opens */
export const STATION_TIME_TOKEN = '{{stationTime}}';

/** `HH:MM` on the station clock (UTC, as the command bar and Ops Log print it) */
export function formatStationTime(timestampMs: number): string {
  const date = new Date(timestampMs);
  const h = date.getUTCHours().toString().padStart(2, '0');
  const m = date.getUTCMinutes().toString().padStart(2, '0');

  return `${h}:${m}`;
}

/**
 * Fill the author tokens in a dialog's text.
 * @param text dialog HTML as authored
 * @param nowMs station-clock ms to stamp (defaults to the scenario clock now)
 */
export function fillDialogTokens(text: string, nowMs: number = getSimulatedNowMs()): string {
  return text.includes(STATION_TIME_TOKEN) ? text.replaceAll(STATION_TIME_TOKEN, formatStationTime(nowMs)) : text;
}
