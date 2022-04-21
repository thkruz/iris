import { SpectrumAnalyzer } from './SpectrumAnalyzer.js';

document.onreadystatechange = function () {
  if (document.readyState === 'complete') {
    const specA = new SpectrumAnalyzer(document.getElementById('test'), {
      refreshRate: 20, // per second
      noiseFloor: -100,
      isShowSignals: false,
    });
    const data = new Float32Array(specA.width);

    specA.update(data);
    specA.signals.push({ freq: 425e6, amp: -108, bw: 3e6 });
    specA.signals.push({ freq: 435e6, amp: -22, bw: 10e6 });
    specA.signals.push({ freq: 445e6, amp: -60, bw: 5e6 });
    specA.start();

    document.getElementById('minFreq').addEventListener('change', function () {
      specA.minFreq = this.value;
    });
    document.getElementById('maxFreq').addEventListener('change', function () {
      specA.maxFreq = this.value;
    });
    document
      .getElementById('noiseFloor')
      .addEventListener('change', function () {
        specA.noiseFloor = parseFloat(this.value);
      });
    document
      .getElementById('refreshRate')
      .addEventListener('change', function () {
        specA.refreshRate = parseFloat(this.value);
      });
    document.getElementById('colors').addEventListener('click', function () {
      specA.isShowSignals = !specA.isShowSignals;
    });
  }
};
