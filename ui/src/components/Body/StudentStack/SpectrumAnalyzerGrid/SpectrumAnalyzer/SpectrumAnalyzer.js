export class SpectrumAnalyzer {
  constructor(canvas, options) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.options = options;
    this.width = canvas.width;
    this.height = canvas.height;
    this.minDecibels = options.minDecibels || -120;
    this.maxDecibels = options.maxDecibels || -20;
    this.isShowSignals = options.isShowSignals || false;
    this.decibelShift = 0 - this.minDecibels; // Shift to 0 as min
    this.range = this.minDecibels - this.maxDecibels;
    this.data = new Float32Array(this.width);
    this.noiseData = new Float32Array(this.width);
    this.refreshRate = options.refreshRate || 10;
    this.lastDrawTime = 0;
    this.noiseFloor = options.noiseFloor || 5;
    this.signals = options.signals || [];
    this.minFreq = options.minFreq || 420e6;
    this.maxFreq = options.maxFreq || 450e6;

    window.addEventListener('resize', () => {
      if (this.canvas.parentElement.offsetWidth !== this.canvas.width) {
        this.resize(this.canvas.parentElement.offsetWidth, this.canvas.parentElement.offsetWidth);
      }
    });
  }

  /**
   * This kicks off the draw loop
   */
  start() {
    if (this.running) return;
    this.running = true;
    this.draw();
  }

  resize(width, height) {
    console.log(this);
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    this.data = new Float32Array(this.width);
    this.noiseData = new Float32Array(this.width);
    this.signals.forEach(signal => {
      signal.maxHold = new Float32Array(this.width);
    });
  }

  /**
   * This creates random noise using the noiseFloor value inside a Float32Array
   * @param {Float32Array} data This is a reusable Float32Array
   * @returns
   */
  createNoise(data) {
    for (let i = 0; i < data.length; i++) {
      data[i] = (0.9 + Math.random() / 10) * (this.noiseFloor + this.decibelShift);
    }
    return data;
  }

  /**
   * This creates a signal inside a Float32Array
   * @param {Float32Array} data This is a reusable Float32Array
   * @param {number} center This is the center of the signal in pixels from the left of the canvas
   * @param {number} amplitude This is the amplitude of the signal in decibels
   * @param {number} width This is the width of the signal in pixels
   * @returns
   */
  createSignal(data, center, amplitude, width) {
    for (let x = 0; x < data.length; x++) {
      let y = (0.9 + Math.random() / 10) * (amplitude + this.decibelShift);

      // Simulate edge of band
      if (x < center - (width / 5) * 3) {
        const distanceFromCenter = Math.abs(x - center - width);
        y -= (distanceFromCenter / width) ** (6.2 + Math.random());
      } else if (x > center + (width / 5) * 3) {
        const distanceFromCenter = Math.abs(x - center + width);
        y -= (distanceFromCenter / width) ** (6.2 + Math.random());
      }

      // Simulate out of band
      if (x < center - width) {
        const distanceFromCenter = Math.abs(x - center - width);
        y -= (distanceFromCenter / width) ** (5.2 + Math.random());
      } else if (x > center + width) {
        const distanceFromCenter = Math.abs(x - center + width);
        y -= (distanceFromCenter / width) ** (5.2 + Math.random());
      }

      if (y > 0) {
        data[x] = y;
      } else {
        data[x] = 0;
      }
    }
    return data;
  }

  /**
   * This draws the spectrum analyzer
   */
  draw() {
    requestAnimationFrame(() => {
      const now = Date.now();
      if (now - this.lastDrawTime > 1000 / this.refreshRate) {
        this.clearCanvas(this.ctx);
        this.noiseData = this.createNoise(this.noiseData);
        this.signals.forEach((signal, i) => {
          let color = '#fff';
          if (this.isShowSignals) {
            color = SpectrumAnalyzer.getRandomRgb(i);
          }
          this.drawSignal(this.ctx, color, signal);
          this.drawMaxHold(this.ctx, color, signal);
        });
        this.drawNoise(this.ctx);

        this.lastDrawTime = now;
      }
      this.draw();
    });
  }

  /**
   * Overwrites the canvas with a black background
   * @param {CanvasRenderingContext2D} ctx SpecA Context
   */
  clearCanvas(ctx) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.width, this.height);
  }

  /**
   * This draws random noise using the noiseFloor value
   * @param {CanvasRenderingContext2D} ctx SpecA Context
   */
  drawNoise(ctx) {
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    for (var x = 0, len = this.noiseData.length; x < len; x++) {
      var y = (this.noiseData[x] - this.maxDecibels - this.decibelShift) / this.range;
      if (x === 0) {
        ctx.moveTo(x, this.height * y);
      } else {
        ctx.lineTo(x, this.height * y);
      }
    }
    ctx.stroke();
  }

  /**
   * This draws the signal
   * @param {CanvasRenderingContext2D} ctx SpecA Context
   * @param {string} color String value of color in Hex
   * @param {*} signal Object containing signal properties
   */
  drawSignal(ctx, color = '#f00', signal) {
    const center = ((signal.freq - this.minFreq) / (this.maxFreq - this.minFreq)) * this.width;
    const width = ((signal.bw / (this.maxFreq - this.minFreq)) * this.width) / 2;

    this.data = this.createSignal(this.data, center, signal.amp, width);

    ctx.strokeStyle = color;
    ctx.beginPath();
    const len = this.data.length;
    for (let x = 0; x < len; x++) {
      const lowestSignal = Math.max(this.data[x], this.noiseData[x]);
      const y = (lowestSignal - this.maxDecibels - this.decibelShift) / this.range;
      if (x === 0) {
        ctx.moveTo(x, this.height * y);
      } else {
        ctx.lineTo(x, this.height * y);
      }
    }
    ctx.stroke();
  }

  /**
   * This draws the maximum value of the signal
   * @param {CanvasRenderingContext2D} ctx SpecA Context
   * @param {string} color String value of color in Hex
   * @param {*} signal Object containing signal properties
   */
  drawMaxHold(ctx, color = '#f00', signal) {
    if (!color) {
      console.log(color);
    }
    if (!signal.maxHold) {
      signal.maxHold = new Float32Array(this.width);
    }

    const center = ((signal.freq - this.minFreq) / (this.maxFreq - this.minFreq)) * this.width;
    const width = ((signal.bw / (this.maxFreq - this.minFreq)) * this.width) / 2;

    this.data = this.createSignal(this.data, center, signal.amp, width);

    ctx.strokeStyle = '#ff0';
    ctx.beginPath();
    const len = this.data.length;
    for (let x = 0; x < len; x++) {
      signal.maxHold[x] = Math.max(this.data[x], signal.maxHold[x]);
      const lowestSignal = Math.max(signal.maxHold[x], this.noiseData[x]);
      const y = (lowestSignal - this.maxDecibels - this.decibelShift) / this.range;
      if (x === 0) {
        ctx.moveTo(x, this.height * y);
      } else {
        ctx.lineTo(x, this.height * y);
      }
    }
    ctx.stroke();
  }

  setBand(band) {
    const freqBandInfo = SpectrumAnalyzer.getFreqBandInfo(band);
    this.minFreq = freqBandInfo.minFreq;
    this.maxFreq = freqBandInfo.maxFreq;
  }

  static getFreqBandInfo(band) {
    const freqBands = {
      hf: {
        minFreq: 3e6,
        maxFreq: 30e6,
      },
      vhf: {
        minFreq: 30e6,
        maxFreq: 300e6,
      },
      uhf: {
        minFreq: 300e6,
        maxFreq: 1e9,
      },
      l: {
        minFreq: 1e9,
        maxFreq: 2e9,
      },
      s: {
        minFreq: 2e9,
        maxFreq: 4e9,
      },
      c: {
        minFreq: 4e9,
        maxFreq: 8e9,
      },
      x: {
        minFreq: 8e9,
        maxFreq: 12e9,
      },
      ku: {
        minFreq: 12e9,
        maxFreq: 18e9,
      },
      k: {
        minFreq: 18e9,
        maxFreq: 27e9,
      },
      ka: {
        minFreq: 27e9,
        maxFreq: 40e9,
      },
      v: {
        minFreq: 40e9,
        maxFreq: 75e9,
      },
      w: {
        minFreq: 75e9,
        maxFreq: 110e9,
      },
      mm: {
        minFreq: 110e9,
        maxFreq: 300e9,
      },
      g: {
        minFreq: 110e9,
        maxFreq: 300e9,
      },
    };
    if (typeof freqBands[band] === 'undefined') throw new Error('Invalid Freq');
    return freqBands[band];
  }

  static rgb2hex(rgb) {
    return `#${rgb
      .map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? `0${hex}` : hex;
      })
      .join('')}`;
  }

  static getRandomRgb(i) {
    let rgb = [255, 0, 0];
    if (i % 3 === 0) {
      rgb[0] = 255;
      rgb[1] = (i * 32) % 255;
      rgb[2] = (i * 64) % 255;
    } else if (i % 3 === 1) {
      rgb[0] = (i * 64) % 255;
      rgb[1] = (i * 32) % 255;
      rgb[2] = 255;
    } else if (i % 3 === 2) {
      rgb[0] = (i * 32) % 255;
      rgb[1] = 255;
      rgb[2] = (i * 64) % 255;
    } else {
      rgb[0] = 255;
      rgb[1] = 255;
      rgb[2] = 255;
    }
    const hex = SpectrumAnalyzer.rgb2hex(rgb);
    return hex;
  }
}
