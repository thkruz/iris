import React, { useContext, useState, createContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { RfEnvironment } from '../RfEnvironment';
// eslint-disable-next-line no-unused-vars
import { io, Socket } from 'socket.io-client';
import {
  antennas,
  defaultAntennaData,
  defaultRxData,
  defaultSignalData,
  defaultTxData,
  defaultUserData,
  satellites,
} from '../constants';
import { CRUDdataTable } from '../crud/crud';
import { githubCheck } from '../lib/github-check';
import config from '../constants/config';

const ApiUrl = config[process.env.REACT_APP_NODE_ENV || 'development'].apiUrl;
const sewAppCtx = createContext({
  sewApp: {},
  updateSewApp: () => {},
  rx: {},
  updateRx: () => {},
  tx: {},
  updateTx: () => {},
  signal: {},
  updateSignal: () => {},
  antenna: {},
  updateAntenna: () => {},
  user: {},
  updateUser: () => {},
});
export const useSewApp = () => {
  return useContext(sewAppCtx);
};

const onSocketUpdateSignals = update => {
  const update_targetsAdded = update.signals.map(x => {
    //const antenna_id = x.antenna_id;
    //const target_id = antennaContext.filter(y => y.id == antenna_id).target_id
    const target_id = 1;
    return { ...x, target_id };
  });
  window.sewApp.environment.updateSignals(update_targetsAdded);
  /*
    window.sewApp.environment.updateSignals(update);
    console.log('updateSignals received', update);
    */
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
};

export const SewAppProvider = ({ children }) => {
  const [sewApp, setSewApp] = useState({});
  const [rx, setRx] = useState(defaultRxData);
  const [tx, setTx] = useState(defaultTxData);
  const [signal, setSignal] = useState(defaultSignalData);
  const [antenna, setAntenna] = useState(defaultAntennaData);
  const [user, setUser] = useState(defaultUserData);

  // Create a sync global context for the RF Environments
  const _sewApp = {
    teamInfo: {
      team: '',
      server: '',
    },
    //updateTxData: useUpdateTx(),
    init: () => {
      if (!githubCheck()) {
        window.sewApp.socketInit(window.sewApp.socket);
      }
    },
    constants: {
      satellites,
      antennas,
    },
    environment: new RfEnvironment(),
    socket: !githubCheck() ? io('http://localhost:8080', { transports: ['websocket'] }) : null,

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
        socket?.emit('updateTeam', { team: sewApp.team });

        socket.on('updateSignals', update => {
          onSocketUpdateSignals(update);
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
      const specA = window.sewApp.getSpectrumAnalyzer(i);
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
        rf: specA.isRfMode ? true : false,
        antenna_id: specA.antenna_id,
      };
      //console.log('announceSpecAChange', sewApp.socket.id);
      sewApp.socket?.emit('updateSpecA', patchData);
      CRUDdataTable({
        method: 'PATCH',
        path: 'spec_a',
        data: patchData,
      });
    },
    socketMocks: {
      updateSignalsCb: onSocketUpdateSignals,
      updateSignals: update => sewApp.socketMocks.updateSignalsCb({ signals: update }),
    },
  };
  window.sewApp = _sewApp;

  // Overall App
  const updateSewApp = () => {
    setSewApp({ ...window.sewApp });
  };

  // //////////// Rx //////////////
  useEffect(() => {
    const ApiUrl = config[process.env.REACT_APP_NODE_ENV || 'development'].apiUrl;
    if (!githubCheck()) {
      fetch(`${ApiUrl}/data/receiver`)
        .then(response => response.json())
        .then(data => {
          //console.log('ReceiverProvider', data);
          setRx([...data]);
        });
    } else {
      // Use the default data
    }
  }, []);

  window.sewApp.socket?.on('updateRxClient', data => {
    if (data.user != window.sewApp.socket.id) {
      console.log('actually updating the Rx');
      setRx(data.signals);
    }
  });

  const updateRx = update => {
    window.sewApp.socket?.emit('updateRx', { user: window.sewApp.socket.id, signals: update });
    setRx(update);
  };

  // //////////// Tx //////////////
  useEffect(() => {
    if (!githubCheck()) {
      fetch(`${ApiUrl}/data/transmitter`)
        .then(response => response.json())
        .then(data => {
          //console.log('TransmitterProvider', data);
          setTx([...data]);
        });
    } else {
      // Use the default context instead!
    }
  }, []);

  window.sewApp.socket?.on('updateTxClient', data => {
    if (data.user != window.sewApp.socket.id) {
      console.log('actually updating the Tx');
      setTx(data.signals);
    }
  });

  const updateTx = update => {
    if (!githubCheck()) {
      window.sewApp.socket?.emit('updateTx', { user: window.sewApp.socket.id, signals: update });
    } else {
      window.sewApp.socketMocks.updateSignals(update);
    }
    setTx(update);
  };

  // //////////// Signal //////////////

  const updateSignal = update => {
    setSignal(update);
  };

  useEffect(() => {
    if (!githubCheck()) {
      fetch(`${ApiUrl}/data/signal`)
        .then(response => response.json())
        .then(data => {
          //console.log('SignalProvider', data);
          window.sewApp.environment.setSignals(data);
          setSignal([...data]);
        });
    } else {
      // Use the default context instead!
      window.sewApp.environment.setSignals(defaultSignalData);
    }
  }, []);

  // //////////// Antenna //////////////
  useEffect(() => {
    if (!githubCheck()) {
      fetch(`${ApiUrl}/data/antenna`)
        .then(response => response.json())
        .then(data => {
          data.forEach(x => {
            x.band = parseInt(x.band);
          });
          setAntenna([...data]);
        });
    } else {
      // Use the default context instead!
    }
  }, []);

  window.sewApp.socket?.on('updateAntennaClient', data => {
    if (data.user != window.sewApp.socket.id) {
      setAntenna(data.signals);
    }
  });

  const updateAntenna = update => {
    //console.log('updateAntenna');
    window.sewApp.socket?.emit('updateAntenna', { user: window.sewApp.socket.id, signals: update });
    setAntenna(update);
  };

  // //////////// User //////////////
  window.sewApp.socket?.on('updateUserClient', data => {
    console.log('updateUserClient', data);
    if (data.user != window.sewApp.socket.id) {
      console.log('actually updating the User');
      setUser(data.signals);
    }
  });

  const updateUser = update => {
    console.log('updateUser', update);
    // patch request to update database
    // if patch request is good
    window.sewApp.socket?.emit('updateUser', { user: window.sewApp.socket.id, signals: update });
    setUser(update);
  };

  return (
    <sewAppCtx.Provider
      value={{
        sewApp,
        updateSewApp,
        rx,
        updateRx,
        tx,
        updateTx,
        signal,
        updateSignal,
        antenna,
        updateAntenna,
        user,
        updateUser,
      }}
    >
      {children}
    </sewAppCtx.Provider>
  );
};

SewAppProvider.propTypes = {
  children: PropTypes.any,
};
