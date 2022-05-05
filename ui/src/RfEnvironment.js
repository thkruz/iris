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
