import { GroundStation } from '@app/assets/ground-station/ground-station';
import { AlarmService } from '@app/services/alarm-service';

export type StationStatusLabel = 'OFFLINE' | 'MAINTENANCE' | 'STOWED' | 'DEGRADED' | 'OPERATIONAL';

/** Badge colour of each station status (dashboard-tab.css `.status-badge-*`) */
export const STATION_STATUS_BADGE: Record<StationStatusLabel, string> = {
  OFFLINE: 'status-badge-red',
  MAINTENANCE: 'status-badge-amber',
  STOWED: 'status-badge-gray',
  DEGRADED: 'status-badge-amber',
  OPERATIONAL: 'status-badge-green',
};

/**
 * What the station is doing, for the Dashboard Station Information card and
 * the Mission Overview station card (Phase 32 D16, nats-r7-s11-F1). The first
 * that applies:
 * - OFFLINE: the station is not operational
 * - MAINTENANCE: its antenna is parked in the maintenance mode
 * - STOWED: its antenna is stowed
 * - DEGRADED: an error-severity alarm is up on the station (AlarmService, the
 *   ticker's source)
 * - OPERATIONAL otherwise
 */
export function stationStatusLabel(gs: GroundStation): StationStatusLabel {
  if (!gs.state.isOperational) return 'OFFLINE';

  const mode = gs.antennas[0]?.state?.trackingMode;
  if (mode === 'maintenance') return 'MAINTENANCE';
  if (mode === 'stow') return 'STOWED';

  if (AlarmService.getAlarms(gs).some((alarm) => alarm.severity === 'error')) return 'DEGRADED';

  return 'OPERATIONAL';
}
