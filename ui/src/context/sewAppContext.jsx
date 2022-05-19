import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { RfEnvironment } from '../RfEnvironment';
// eslint-disable-next-line no-unused-vars
import { io, Socket } from 'socket.io-client';
import { antennas, satellites } from '../constants';
import { CRUDdataTable } from './../crud/crud';
import axios from 'axios';

const url = config[process.env.REACT_APP_NODE_ENV || 'development'].apiUrl;

// Create a sync global context for the RF Environments
const sewApp = {
  teamInfo: {
    team: '',
    server: '',
  },
  init: () => {
    window.sewApp.socketInit(window.sewApp.socket);
  },
  constants: {
    satellites,
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
        team: 'default', // TODO: Replace this properly
        server: '',
      };

      // patch the server with the team info
      axios.patch(`${url}/data/server?id=${window.sewApp.teamInfo.server.id}`, window.sewApp.teamInfo)
        .then(res => {
          if (res.status === 200) {
            socket.emit('updateTeam', { team: sewApp.team });
          } else {
            console.log('error patching team');
            window.alert('error patching team');
          }
        })
        .catch(err => {
          console.log('error patching team', err);
        });

      socket.on('updateSignals', update => {
        window.sewApp.environment.updateSignals(update);
        console.log('updateSignals received', update);
        for (let i = 1; i <= 4; i++) {
          const specA = window.sewApp.getSpectrumAnalyzer(i);
          specA.signals = specA.signals.filter(signal => {
            return signal.team_id !== update.signals[0].team_id;
          });
          window.sewApp.environment.signals.forEach(signal => {
            specA.signals.push({
              team_id: signal.team_id,
              freq: signal.frequency * 1e6,
              amp: signal.power,
              bw: signal.bandwidth * 1e6,
              target_id: signal.target_id,
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
  announceSpecAChange: i => {
    const specA = sewApp.getSpectrumAnalyzer(i);
    const patchData = {
      id: specA.isRfMode ? specA.config.rf.id : specA.config.if.id,
      server_id: 1,
      team_id: 1,
      unit: specA.whichUnit,
      number: specA.isRfMode ? 2 : 1,
      operational: true,
      frequency: specA.centerFreq / 1e6,
      span: specA.bw / 1e6,
      marker1freq: 1240,
      marker2freq: 1260,
      trace: specA.isDrawHold,
      rf: false,
      antenna_id: specA.antenna_id,
    };
    console.log('announceSpecAChange', sewApp.socket.id);
    
    // send patch request to server
    axios.patch(`${url}/data/spec_a`, patchData)
      .then(res => {
        if (res.status === 200) {
          sewApp.socket.emit('updateSpecA', patchData);
        }
        else {
          console.log('Error patching SpecA');
        }
      })
      .catch(err => {
        console.log('Error patching SpecA', err);
      });
    
    // I don't think this is needed if we use axios
    /*
    CRUDdataTable({
      method: 'PATCH',
      path: 'spec_a',
      data: patchData,
    });
    */
  },
};

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
    setSewApp({ ...window.sewApp });
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
