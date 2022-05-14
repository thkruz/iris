import { SpectrumAnalyzer } from './SpectrumAnalyzer';

const testSignal = {
  bw: 0,
  centerFreq: 0,
  maxFreq: 0,
  minFreq: 0,
};
describe('spectrumAnalyzer', () => {
  let spectrumAnalyzer;
  beforeEach(() => {
    spectrumAnalyzer = new SpectrumAnalyzer({
      getContext: () => ({
        strokeStyle: '#000',
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        stroke: () => {},
        closePath: () => {},
        fill: () => {},
        fillRect: () => {},
        fillText: () => {},
      }),
      width: 100,
      height: 100,
      offsetWidth: 100,
      offsetHeight: 100,
      parentElement: {
        offsetWidth: 100,
        offsetHeight: 100,
      },
    });
  });

  it('should be able to start', () => {
    const result = () => {
      spectrumAnalyzer.start();
      spectrumAnalyzer.start();
    };
    expect(result).not.toThrow();
  });

  // changeCenterFreq
  it('should be able to changeCenterFreq', () => {
    const result = spectrumAnalyzer.changeCenterFreq(0);
    expect(() => result).not.toThrow();
  });

  // changeBandwidth
  it('should be able to changeBandwidth', () => {
    const result = spectrumAnalyzer.changeBandwidth(0);
    expect(() => result).not.toThrow();
  });

  // resize
  it('should be able to resize', () => {
    const result = spectrumAnalyzer.resize(-10, -10);
    expect(() => result).not.toThrow();
  });

  // createNoise
  it('should be able to createNoise', () => {
    const result = spectrumAnalyzer.createNoise(spectrumAnalyzer.data);
    expect(() => result).not.toThrow();
  });

  // resetHoldData
  it('should be able to resetHoldData', () => {
    const result = spectrumAnalyzer.resetHoldData();
    expect(() => result).not.toThrow();
  });

  // createSignal
  it('should be able to createSignal', () => {
    const result = spectrumAnalyzer.createSignal(spectrumAnalyzer.data, 0, 0, 0, 0);
    expect(() => result).not.toThrow();
  });

  // draw
  it('should be able to draw', () => {
    const result = spectrumAnalyzer.draw();
    expect(() => result).not.toThrow();
  });

  // animate
  it('should be able to animate', () => {
    let result;
    spectrumAnalyzer.signals = [
      { ...testSignal, rf: true, targetId: 1 },
      { ...testSignal, targetId: 1 },
    ];
    spectrumAnalyzer.targetId = 1;
    spectrumAnalyzer.lastDrawTime = 0;
    result = spectrumAnalyzer.animate();
    expect(() => result).not.toThrow();

    spectrumAnalyzer.isRfMode = true;
    spectrumAnalyzer.lastDrawTime = 0;
    result = spectrumAnalyzer.animate();
    expect(() => result).not.toThrow();

    spectrumAnalyzer.isShowSignals = true;
    spectrumAnalyzer.isDrawHold = true;
    spectrumAnalyzer.lastDrawTime = 0;
    result = spectrumAnalyzer.animate();
    expect(() => result).not.toThrow();
    result = spectrumAnalyzer.animate();
    expect(() => result).not.toThrow();
  });

  // drawGridOverlay
  it('should be able to drawGridOverlay', () => {
    const result = spectrumAnalyzer.drawGridOverlay(spectrumAnalyzer.ctx);
    expect(() => result).not.toThrow();
  });

  it('should handle a resize event', () => {
    expect(() => global.dispatchEvent(new Event('resize'))).not.toThrow();
  });

  // clearCanvas
  it('should be able to clearCanvas', () => {
    const result = spectrumAnalyzer.clearCanvas(spectrumAnalyzer.ctx);
    expect(() => result).not.toThrow();
  });

  // hideBelowNoiseFloor
  it('should be able to hideBelowNoiseFloor', () => {
    const result = spectrumAnalyzer.hideBelowNoiseFloor(spectrumAnalyzer.ctx);
    expect(() => result).not.toThrow();
  });

  // drawNoise
  it('should be able to drawNoise', () => {
    const result = spectrumAnalyzer.drawNoise(spectrumAnalyzer.ctx);
    expect(() => result).not.toThrow();
  });

  // drawSignal
  it('should be able to drawSignal', () => {
    let result;
    result = spectrumAnalyzer.drawSignal(spectrumAnalyzer.ctx, '#000', testSignal);
    expect(() => result).not.toThrow();

    spectrumAnalyzer.isDrawMarker = true;
    result = spectrumAnalyzer.drawSignal(spectrumAnalyzer.ctx, '#000', testSignal);
    expect(() => result).not.toThrow();
  });

  // drawMarker
  it('should be able to drawMarker', () => {
    const result = spectrumAnalyzer.drawMarker(10, 20, spectrumAnalyzer.ctx, 15);
    expect(() => result).not.toThrow();
  });

  // drawMaxHold
  it('should be able to drawMaxHold', () => {
    const result = spectrumAnalyzer.drawMaxHold(spectrumAnalyzer.ctx);
    expect(() => result).not.toThrow();
  });

  // setBand
  it('should be able to setBand', () => {
    const result = spectrumAnalyzer.setBand('ku');
    expect(() => result).not.toThrow();
  });

  // getFreqBandInfo
  it('should be able to getFreqBandInfo', () => {
    let result;
    result = () => SpectrumAnalyzer.getFreqBandInfo('c');
    expect(() => result).not.toThrow();
    result = () => SpectrumAnalyzer.getFreqBandInfo('ku');
    expect(() => result).not.toThrow();
    result = () => SpectrumAnalyzer.getFreqBandInfo('wtf');
    expect(result).toThrow();
  });

  // rgb2hex
  it('should be able to rgb2hex', () => {
    const result = SpectrumAnalyzer.rgb2hex([0, 0, 0]);
    expect(() => result).not.toThrow();
  });

  // getRandomRgb
  it('should be able to getRandomRgb', () => {
    let result;
    result = SpectrumAnalyzer.getRandomRgb();
    expect(() => result).not.toThrow();
    result = SpectrumAnalyzer.getRandomRgb(1);
    expect(() => result).not.toThrow();
    result = SpectrumAnalyzer.getRandomRgb(2);
    expect(() => result).not.toThrow();
    result = SpectrumAnalyzer.getRandomRgb(3);
    expect(() => result).not.toThrow();
  });
});
