export class RfEnvironment {
  constructor(options) {
    this.satellites = options.satellites || [];
    this.antenna = options.antenna || [{
      gain: 1,
      height: 0,
      azimuth: 0,
      elevation: 0,
      polarization: 'horizontal'
      target: null,
      autoTrack: true,
    },
    {
      gain: 1,
      height: 0,
      azimuth: 0,
      elevation: 0,
      polarization: 'horizontal'
      target: null,
      autoTrack: true,
    }];
    this.receiver = options.receiver || [{
      antenna: 0,
      freq: 425e6,
      bw: 10e6,
    },
    {
      antenna: 0,
      freq: 435e6,
      bw: 10e6,
    },
    {
      antenna: 1,
      freq: 425e6,
      bw: 10e6,
    },
    {
      antenna: 1,
      freq: 435e6,
      bw: 10e6,
    },
    ],

  }
}
