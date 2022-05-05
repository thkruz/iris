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
    this.maxHoldData = new Float32Array(this.width);
    this.noiseData = new Float32Array(this.width);
    this.refreshRate = options.refreshRate || 10;
    this.lastDrawTime = 0;
    this.noiseFloor = options.noiseFloor || 5;
    this.signals = options.signals || [];
    this.minFreq = options.minFreq || 420e6;
    this.maxFreq = options.maxFreq || 450e6;
    this.bw = this.maxFreq - this.minFreq;
    this.centerFreq = this.minFreq + this.bw / 2;
    this.noiseColor = options.noiseColor || '#0bf';

    this.resize(this.canvas.parentElement.offsetWidth - 6, this.canvas.parentElement.offsetWidth - 6);

    window.addEventListener('resize', () => {
      if (this.canvas.parentElement.offsetWidth - 6 !== this.canvas.width - 6) {
        this.resize(this.canvas.parentElement.offsetWidth - 6, this.canvas.parentElement.offsetWidth - 6);
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

  changeCenterFreq(freq) {
    this.centerFreq = freq;
    this.minFreq = freq - this.bw / 2;
    this.maxFreq = freq + this.bw / 2;
  }

  changeBandwidth(freqSpan) {
    this.bw = freqSpan;
    this.minFreq = this.centerFreq - this.bw / 2;
    this.maxFreq = this.centerFreq + this.bw / 2;
  }

  resize(width, height) {
    this.width = width > 0 ? width : 10; // Jest
    this.height = height > 0 ? height : 10; // Jest
    this.canvas.width = width > 0 ? width : 10; // Jest
    this.canvas.height = height > 0 ? height : 10; // Jest
    this.data = new Float32Array(this.width);
    this.noiseData = new Float32Array(this.width);
    this.maxHoldData = new Float32Array(this.width);
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
    for (let x = 0; x < data.length; x++) {
      data[x] = (0.5 + (5 * Math.random()) / 10) * (this.noiseFloor + this.decibelShift);
      if (Math.random() > 0.999) {
        data[x] *= 1 + Math.random();
      }

      if (this.maxHoldData[x] < data[x]) {
        this.maxHoldData[x] = data[x];
      }
    }
    return data;
  }

  resetHoldData() {
    this.maxHoldData = new Float32Array(this.width);
  }

  /**
   * This creates a signal inside a Float32Array
   * @param {Float32Array} data This is a reusable Float32Array
   * @param {number} center This is the center of the signal in pixels from the left of the canvas
   * @param {number} amplitude This is the amplitude of the signal in decibels
   * @param {number} inBandWidth This is the width of the signal in pixels
   * @returns
   */
  createSignal(data, center, amplitude, inBandWidth, outOfBandWidth) {
    // NOTE: This could be used to create amplitude modulation
    // const isSkipTimeslot = Math.random() > 0.95;
    // if (isSkipTimeslot) {
    //   data = new Float32Array(data.length);
    //   return data;
    // }

    for (let x = 0; x < data.length; x++) {
      let y = 0;

      if (x > center - outOfBandWidth || x < center + outOfBandWidth) {
        y = (0.75 + Math.random() / 4) * (amplitude + this.decibelShift);
        //y = (0.9 + Math.random() / 10) * (amplitude + this.decibelShift);
      }

      // Simulate Drop Near Edge of Band
      if (x < center - inBandWidth * 0.5) {
        if (Math.random() < 0.95) {
          const distanceFromCenter = Math.abs(x - center - inBandWidth);
          y -= (distanceFromCenter / inBandWidth / 1.5) ** (6.5 + Math.random());
        }
      } else if (x > center + inBandWidth * 0.5) {
        if (Math.random() < 0.95) {
          const distanceFromCenter = Math.abs(x - center + inBandWidth);
          y -= (distanceFromCenter / inBandWidth / 1.5) ** (6.5 + Math.random());
        }
      }

      // Simulate Drop Near Edge of Band
      if (x < center - inBandWidth * 0.75) {
        if (Math.random() < 0.93) {
          const distanceFromCenter = Math.abs(x - center - inBandWidth);
          y -= (distanceFromCenter / inBandWidth) ** (1.5 + Math.random());
        }
      } else if (x > center + inBandWidth * 0.75) {
        if (Math.random() < 0.93) {
          const distanceFromCenter = Math.abs(x - center + inBandWidth);
          y -= (distanceFromCenter / inBandWidth) ** (1.5 + Math.random());
        }
      }

      // Simulate Drop Near Edge of Band
      if (x < center - inBandWidth * 0.9) {
        if (Math.random() < 0.9) {
          const distanceFromCenter = Math.abs(x - center - inBandWidth);
          y -= (distanceFromCenter / inBandWidth) ** (2.5 + Math.random());
        }
      } else if (x > center + inBandWidth * 0.9) {
        if (Math.random() < 0.9) {
          const distanceFromCenter = Math.abs(x - center + inBandWidth);
          y -= (distanceFromCenter / inBandWidth) ** (2.5 + Math.random());
        }
      }

      // Zero Out Signal Far Outside of the Band
      if (x > center + outOfBandWidth || x < center - outOfBandWidth) {
        y = 0;
      } else {
        // Simulate Some Bleed outside of the band
        if (x < center - inBandWidth) {
          y = 0;
          // TODO: Not sure how to handle the idea of out of Band

          // if (y > 0.8 * (amplitude + this.decibelShift)) {
          //   y = 0;
          // } else {
          //   const distanceFromCenter = Math.abs(x - center - inBandWidth);
          //   y -= (distanceFromCenter / outOfBandWidth) ** (3 + Math.random());
          // }
        } else if (x > center + inBandWidth) {
          y = 0;
          // TODO: Not sure how to handle the idea of out of Band

          // if (y > 0.8 * (amplitude + this.decibelShift)) {
          //   y = 0;
          // } else {
          //   const distanceFromCenter = Math.abs(x - center + outOfBandWidth);
          //   y -= (distanceFromCenter / outOfBandWidth) ** (3 + Math.random());
          // }
        }
      }

      // Raise Hold Floor
      if (this.maxHoldData[x] < y) {
        this.maxHoldData[x] = y;
      }

      // Raise Noise Floor
      if (this.noiseData[x] < y) {
        this.noiseData[x] = y;
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
        this.ctx.globalAlpha = 1.0;
        this.noiseData = this.createNoise(this.noiseData);
        this.drawNoise(this.ctx);

        this.signals.forEach((signal, i) => {
          let color = this.noiseColor;
          if (this.isShowSignals) {
            color = SpectrumAnalyzer.getRandomRgb(i);
          }
          this.drawSignal(this.ctx, color, signal);
        });

        if (this.isDrawHold) {
          this.drawMaxHold(this.ctx);
        }

        this.hideBelowNoiseFloor(this.ctx);

        this.drawGridOverlay(this.ctx);

        this.lastDrawTime = now;
      }
      this.draw();
    });
  }

  drawGridOverlay(ctx) {
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = 'white';
    for (let x = 0; x < this.width; x += this.width / 10) {
      ctx.fillRect(x, 0, 1, this.height);
    }
    for (let y = 0; y < this.height; y += this.height / 10) {
      ctx.fillRect(0, y, this.width, 1);
    }
    ctx.globalAlpha = 1.0;
  }

  /**
   * Overwrites the canvas with a black background
   * @param {CanvasRenderingContext2D} ctx SpecA Context
   */
  clearCanvas(ctx) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.width, this.height);
  }

  hideBelowNoiseFloor(ctx) {
    ctx.beginPath();
    ctx.fillStyle = '#000';
    ctx.moveTo(0, this.height);

    for (let x = 0; x < this.width; x++) {
      var y = (this.noiseData[x] - this.maxDecibels - this.decibelShift) / this.range;
      ctx.lineTo(x, this.height * y);
    }
    ctx.lineTo(this.width, this.height);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * This draws random noise using the noiseFloor value
   * @param {CanvasRenderingContext2D} ctx SpecA Context
   */
  drawNoise(ctx) {
    ctx.strokeStyle = this.noiseColor;
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
    const inBandWidth = ((signal.bw / (this.maxFreq - this.minFreq)) * this.width) / 2;
    const outOfBandWidth = ((signal.bw / (this.maxFreq - this.minFreq)) * this.width) / 1.8;

    this.data = this.createSignal(this.data, center, signal.amp, inBandWidth, outOfBandWidth);

    ctx.strokeStyle = color;
    ctx.beginPath();
    const len = this.data.length;
    for (let x = 0; x < len; x++) {
      const lowestSignal = this.data[x] >= this.noiseData[x] ? this.data[x] : 0;
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
  drawMaxHold(ctx, color = '#ff0') {
    if (!color) {
      console.log(color);
    }

    // const center = ((signal.freq - this.minFreq) / (this.maxFreq - this.minFreq)) * this.width;
    // const width = ((signal.bw / (this.maxFreq - this.minFreq)) * this.width) / 2;

    ctx.strokeStyle = color;
    ctx.beginPath();
    const len = this.data.length;
    for (let x = 0; x < len; x++) {
      const y = (this.maxHoldData[x] - this.maxDecibels - this.decibelShift) / this.range;
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
