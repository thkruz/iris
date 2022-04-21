export class SpectrumAnalyzer {
  // NOTE: y axis needs to be drawn with  postiive numbers
  constructor(canvas, options) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.options = options;
    this.width = canvas.width;
    this.height = canvas.height;
    this.minDecibels = options.minDecibels || -120;
    this.maxDecibels = options.maxDecibels || -20;
    this.isShowSignals = options.isShowSignals || false;
    this.decibelShift = 120; // Shift to 0 as min
    this.range = this.minDecibels - this.maxDecibels;
    this.data = new Float32Array(this.width);
    this.refreshRate = options.refreshRate || 10;
    this.lastDrawTime = 0;
    this.noiseFloor = options.noiseFloor || 5;
    this.signals = options.signals || [];
    this.minFreq = options.minFreq || 420e6;
    this.maxFreq = options.maxFreq || 450e6;
  }
  start() {
    var self = this;
    if (self.running) return;
    self.running = true;

    if (!self.running) return;
    self.draw();
  }
  createNoise(data) {
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * (this.noiseFloor + this.decibelShift);
    }
    return data;
  }
  createSignal(data, center, amplitude, width) {
    for (let x = 0; x < data.length; x++) {
      let y = Math.random() * (amplitude + this.decibelShift);
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
  draw() {
    requestAnimationFrame(() => {
      const now = Date.now();
      if (now - this.lastDrawTime > 1000 / this.refreshRate) {
        this.clearCanvas(this.ctx);
        this.signals.forEach((signal, i) => {
          let color = '#fff';
          if (this.isShowSignals) {
            switch (i) {
              case 0:
                color = '#f00';
                break;
              case 1:
                color = '#0f0';
                break;
              case 2:
                color = '#00f';
                break;
              case 3:
                color = '#ff0';
                break;
              case 4:
                color = '#0ff';
                break;
              case 5:
                color = '#f0f';
                break;
            }
          }
          this.drawSignal(this.ctx, color, signal);
        });
        this.drawNoise(this.ctx);

        this.lastDrawTime = now;
      }
      this.draw();
    });
  }

  clearCanvas(ctx) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.width, this.height);
  }

  drawNoise(ctx) {
    this.data = this.createNoise(this.data);

    ctx.fillStyle = '#fff';
    for (var x = 0, len = this.data.length; x < len; x++) {
      var y =
        (this.data[x] - this.maxDecibels - this.decibelShift) / this.range;
      ctx.fillRect(x, this.height * y, 1, this.height * (1 - y));
    }
  }

  drawSignal(ctx, color = '#f00', signal) {
    const center =
      ((signal.freq - this.minFreq) / (this.maxFreq - this.minFreq)) *
      this.width;
    const width =
      ((signal.bw / (this.maxFreq - this.minFreq)) * this.width) / 2;

    this.data = this.createSignal(this.data, center, signal.amp, width);

    ctx.fillStyle = color;
    const len = this.data.length;
    for (var x = 0; x < len; x++) {
      var y =
        (this.data[x] - this.maxDecibels - this.decibelShift) / this.range;
      ctx.fillRect(x, this.height * y, 1, this.height * (1 - y));
    }
  }

  update(data) {
    this.data = data;
    this.draw();
  }
}
