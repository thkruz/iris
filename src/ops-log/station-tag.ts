/**
 * @file station-tag.ts - Which ground station an equipment event belongs to
 * @description In a multi-station scenario (VT-01 + ME-02) every Ops Log entry
 * carries the station's id so lines from two sites can be told apart
 * (nats-r3-s11-F1). Single-station scenarios get no tag.
 *
 * The stations are read from window.signalRange.simulationManager rather than
 * by importing SimulationManager, which itself imports the ops log.
 */

import type { GroundStation } from '@app/assets/ground-station/ground-station';
import type { RFFrontEndCore } from '@app/equipment/rf-front-end/rf-front-end-core';

interface WindowWithSimulation {
  signalRange?: {
    simulationManager?: {
      groundStations?: GroundStation[];
    };
  };
}

/** The scenario's ground stations (empty outside a running scenario) */
export function scenarioGroundStations(): GroundStation[] {
  const w = globalThis as unknown as WindowWithSimulation;

  return w.signalRange?.simulationManager?.groundStations ?? [];
}

/**
 * Station id for an Ops Log tag: the first station matching the predicate,
 * or undefined when the scenario has one station (no tag needed) or none match.
 */
export function stationTagFor(predicate: (gs: GroundStation) => boolean): string | undefined {
  const stations = scenarioGroundStations();
  if (stations.length < 2) return undefined;

  try {
    return stations.find(predicate)?.state?.id;
  } catch {
    return undefined;
  }
}

/** Every module state object of an RF front end */
function rfModuleStates_(rf: RFFrontEndCore): unknown[] {
  return [
    rf.omtModule?.state,
    rf.bucModule?.state,
    rf.hpaModule?.state,
    rf.agcModule?.state,
    rf.notchFilterModule?.state,
    rf.filterModule?.state,
    rf.lnbModule?.state,
    rf.couplerModule?.state,
    rf.gpsdoModule?.state,
  ];
}

/** Station owning an RF front-end module whose state object is `state` */
export function stationTagForRfState(state: unknown): string | undefined {
  return stationTagFor((gs) => (gs.rfFrontEnds ?? []).some((rf) => rfModuleStates_(rf).includes(state)));
}

/** Station owning an RF front-end module (the module object itself) */
export function stationTagForRfModule(module: unknown): string | undefined {
  return stationTagFor((gs) =>
    (gs.rfFrontEnds ?? []).some(
      (rf) =>
        rf.omtModule === module ||
        rf.bucModule === module ||
        rf.hpaModule === module ||
        rf.agcModule === module ||
        rf.notchFilterModule === module ||
        rf.filterModule === module ||
        rf.lnbModule === module ||
        rf.couplerModule === module ||
        rf.gpsdoModule === module
    )
  );
}

/** Station owning the antenna whose state object (or uuid) is given */
export function stationTagForAntennaState(state: { uuid?: string } | undefined): string | undefined {
  if (!state) return undefined;

  return stationTagFor((gs) => (gs.antennas ?? []).some((a) => a.state === state || (state.uuid !== undefined && a.state?.uuid === state.uuid)));
}

/**
 * Station owning the transmitter or receiver with this equipment uuid, or
 * (TX events) holding this modem object
 */
export function stationTagForModemUuid(uuid: string | undefined, modem?: unknown): string | undefined {
  if (!uuid && modem === undefined) return undefined;

  return stationTagFor(
    (gs) =>
      (gs.transmitters ?? []).some((t) => (modem !== undefined && t.state?.modems?.includes(modem as never)) || (uuid !== undefined && t.state?.uuid === uuid)) ||
      (gs.receivers ?? []).some((r) => uuid !== undefined && r.state?.uuid === uuid)
  );
}

/** Ops Log source label: "VT-01 TX" in a multi-station scenario, "TX" otherwise */
export function stationSource(system: string, stationId: string | undefined): string {
  return stationId ? `${stationId} ${system}` : system;
}
