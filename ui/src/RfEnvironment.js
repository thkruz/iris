export class RfEnvironment {
  constructor() {
    this.signals = [];
  }

  setSignals(signals) {
    this.signals = signals;
  }

  addSignal(signal) {
    this.signals.push(signal);
  }

  getSignals() {
    return this.signals;
  }

  updateSignals(update) {
    console.log(this.signals);

    // Purge all signals that are from this user
    this.signals = this.signals.filter(signal => {
      return signal.user !== update.user;
    });

    // Add the new signals
    update.signals.forEach(signal => {
      if (signal.transmitting) {
        this.signals.push({ ...{ user: update.user }, ...signal });
      }
    });

    console.log(this.signals);
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
