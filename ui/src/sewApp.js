import { RfEnvironment } from './RfEnvironment';
// eslint-disable-next-line no-unused-vars
import { io, Socket } from 'socket.io-client';

// Create a sync global context for the RF Environments
const sewApp = {
  init: () => {
    window.sewApp.socketInit(window.sewApp.socket);
  },
  environment: new RfEnvironment(),
  socket: io('http://localhost:8080', {transports: ['websocket']}),

  /**
   *
   * @param {Socket} socket
   */
  socketInit: socket => {
    socket.on('connect', () => {
      console.log('Connected to the server');

      socket.on('updateSignals', update => {
        window.sewApp.environment.updateSignals(update);

        for (let i = 1; i <= 4; i++) {
          const specA = window.sewApp.getSpectrumAnalyzer(i);
          specA.signals = specA.signals.filter(signal => {
            return signal.user !== update.user;
          });
          window.sewApp.environment.signals.forEach(signal => {
            specA.signals.push({
              user: update.user,
              freq: signal.frequency * 1e6,
              amp: signal.power,
              bw: signal.bandwidth * 1e6,
              targetId: signal.targetId,
            });
          });
        }
      });
    });
    socket.on('disconnect', () => {
      console.log('Disconnected from the server');
    });

    socket.connect();
  },
  getSpectrumAnalyzer: i => {
    if (i === 1) return window.sewApp.specA1;
    if (i === 2) return window.sewApp.specA2;
    if (i === 3) return window.sewApp.specA3;
    if (i === 4) return window.sewApp.specA4;
  },
};

window.sewApp = sewApp;
