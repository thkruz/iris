import { SpectrumAnalyzer } from './../components/Body/StudentStack/SpectrumAnalyzerGrid/SpectrumAnalyzer/SpectrumAnalyzer.js';

document.onreadystatechange = function () {
  if (document.readyState === 'complete') {
    const specA = new SpectrumAnalyzer(document.getElementById('test'), {
      refreshRate: 5, // per second
      noiseFloor: -100,
      isShowSignals: false,
    });
    //const data = new Float32Array(specA.width);

    specA.signals.push({ freq: 425e6, amp: -108, bw: 3e6 });
    specA.signals.push({ freq: 435e6, amp: -22, bw: 10e6 });
    specA.signals.push({ freq: 445e6, amp: -60, bw: 5e6 });
    specA.signals.push({ freq: 448e6, amp: -60, bw: 1e6 });
    specA.signals.push({ freq: 422e6, amp: -60, bw: 0.5e6 });
    specA.signals.push({ freq: 423e6, amp: -60, bw: 1e6 });
    specA.start();

    document.getElementById('minFreq').addEventListener('change', function () {
      const minFreqArr = this.value.split(' ');
      if (minFreqArr.length === 2) {
        switch (minFreqArr[1].toLowerCase()) {
          case 'khz':
            specA.minFreq = parseFloat(minFreqArr[0]) * 1e3;
            break;
          case 'mhz':
            specA.minFreq = parseFloat(minFreqArr[0]) * 1e6;
            break;
          case 'ghz':
            specA.minFreq = parseFloat(minFreqArr[0]) * 1e9;
            break;
          default:
            this.value = specA.minFreq;
        }
      } else {
        specA.minFreq = parseFloat(this.value);
      }
    });
    document.getElementById('maxFreq').addEventListener('change', function () {
      const maxFreqArr = this.value.split(' ');
      if (maxFreqArr.length === 2) {
        switch (maxFreqArr[1].toLowerCase()) {
          case 'khz':
            specA.maxFreq = parseFloat(maxFreqArr[0]) * 1e3;
            break;
          case 'mhz':
            specA.maxFreq = parseFloat(maxFreqArr[0]) * 1e6;
            break;
          case 'ghz':
            specA.maxFreq = parseFloat(maxFreqArr[0]) * 1e9;
            break;
          default:
            this.value = specA.maxFreq;
        }
      } else {
        specA.maxFreq = parseFloat(this.value);
      }
    });
    document.getElementById('noiseFloor').addEventListener('change', function () {
      specA.noiseFloor = parseFloat(this.value);
    });
    document.getElementById('refreshRate').addEventListener('change', function () {
      specA.refreshRate = parseFloat(this.value);
    });
    document.getElementById('colors').addEventListener('click', function () {
      specA.isShowSignals = !specA.isShowSignals;
    });
    document.getElementById('test').addEventListener('wheel', function (e) {
      specA.minFreq -= (((e.deltaY * specA.minFreq) / 1e3) * e.x) / specA.width;
      document.getElementById('minFreq').value = `${(specA.minFreq / 1e6).toFixed(2)} MHz`;

      specA.maxFreq += ((e.deltaY * specA.minFreq) / 1e3) * (1 - e.x / specA.width);
      document.getElementById('maxFreq').value = `${(specA.maxFreq / 1e6).toFixed(2)} MHz`;

      if (specA.maxFreq < specA.minFreq) {
        specA.maxFreq = specA.minFreq + specA.minFreq / 10;
        document.getElementById('maxFreq').value = `${(specA.maxFreq / 1e6).toFixed(2)} MHz`;
      }
    });
    document.getElementById('freqBand').addEventListener('change', function (e) {
      const newFreqBand = this.value.toLowerCase();
      if (newFreqBand === 'mm/g') newFreqBand = 'mm';
      specA.setBand(newFreqBand);

      document.getElementById('minFreq').value = `${(specA.minFreq / 1e6).toFixed(2)} MHz`;
      document.getElementById('maxFreq').value = `${(specA.maxFreq / 1e6).toFixed(2)} MHz`;
    });
  }
};
