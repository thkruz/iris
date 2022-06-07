export class RfEnvironment {
  constructor() {
    this.signals = [];
  }

  setSignals(signals) {
    this.signals = signals;
  }

  setTargets(targets) {
    this.targets = targets;
  }

  setTeams(teams) {
    this.teams = teams;
  }

  setAntennas(antennas) {
    this.antennas = antennas;
  }

  setSpecAs(specAs) {
    this.specAs = specAs;
  }

  setTransmitters(transmitters) {
    this.transmitters = transmitters;
  }

  setReceivers(receivers) {
    this.receivers = receivers;
  }

  addSignal(signal) {
    this.signals.push(signal);
  }

  getSignals() {
    return this.signals;
  }

  updateSignals(update) {
    // Purge all signals that are from this team
    this.signals = this.signals.filter(signal => {
      return signal.team_id !== update[0].team_id;
    });
    // Add the new signals
    update.forEach(signal => {
      if (signal.transmitting) {
        //this.signals.push({ ...{ team_id: signal.team_id }, ...signal });
        this.signals.push(signal);
      }
    });
  }

  clearSignals() {
    this.signals = [];
  }

  removeSignal(signal) {
    const index = this.signals.indexOf(signal);
    if (index > -1) {
      this.signals.splice(index, 1);
    }
  }
}
