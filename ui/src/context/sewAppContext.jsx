import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { RfEnvironment } from '../RfEnvironment';
// eslint-disable-next-line no-unused-vars
import { io, Socket } from 'socket.io-client';
import { antennas } from '../antennas';
import { targets } from '../targets';

// Create a sync global context for the RF Environments
const sewApp = {
  teamInfo: {
    team: 'blue',
    server: '',
  },
  //updateTxData: useUpdateTx(),
  init: () => {
    window.sewApp.socketInit(window.sewApp.socket);
  },
  constants: {
    targets,
    antennas,
  },
  environment: new RfEnvironment(),
  socket: io('http://localhost:8080', { transports: ['websocket'] }),

  /**
   *
   * @param {Socket} socket
   */
  socketInit: socket => {
    socket.on('connect', () => {
      console.log('Connected to the server');
      window.sewApp.teamInfo = {
        team: 'blue',
        server: 'Connected',
      };
      socket.emit('updateTeam', { team: sewApp.team });

      socket.on('updateSignals', update => {
        window.sewApp.environment.updateSignals(update);
        console.log('updateSignals received', update);
        for (let i = 1; i <= 4; i++) {
          const specA = window.sewApp.getSpectrumAnalyzer(i);
          specA.signals = specA.signals.filter(signal => {
            return signal.team !== update.team;
          });
          window.sewApp.environment.signals.forEach(signal => {
            specA.signals.push({
              team: update.team,
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

/**
 * ===============================
 * Context Code
 * ===============================
 */
const sewAppContext = React.createContext();
const updateSewAppContext = React.createContext();

export const useSewApp = () => {
  return useContext(sewAppContext);
};

export const useUpdateSewApp = () => {
  return useContext(updateSewAppContext);
};

export const SewAppProvider = ({ children }) => {
  const [sewApp, setSewApp] = useState({});
  const updateSewApp = () => {
    setSewApp(window.sewApp);
  };

  return (
    <sewAppContext.Provider value={sewApp}>
      <updateSewAppContext.Provider value={updateSewApp}>{children}</updateSewAppContext.Provider>
    </sewAppContext.Provider>
  );
};

SewAppProvider.propTypes = {
  children: PropTypes.any,
};

window.sewApp = sewApp;
