import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
const rxContext = React.createContext();
const updateRxContext = React.createContext();

const defaultRxContext = [
  {
    id: 1,
    server_id: 1,
    team_id: 1,
    unit: 1,
    number: 1,
    operational: true,
    antenna_id: 1,
    frequency: 1000,
    bandwidth: 10,
    modulation: 'BPSK',
    fec: '1/2',
  },
  {
    id: 2,
    server_id: 1,
    team_id: 1,
    unit: 1,
    number: 2,
    operational: true,
    antenna_id: 1,
    frequency: 1000,
    bandwidth: 10,
    modulation: 'BPSK',
    fec: '1/2',
  },
  {
    id: 3,
    server_id: 1,
    team_id: 1,
    unit: 1,
    number: 3,
    operational: true,
    antenna_id: 1,
    frequency: 1000,
    bandwidth: 10,
    modulation: 'BPSK',
    fec: '1/2',
  },
  {
    id: 4,
    server_id: 1,
    team_id: 1,
    unit: 1,
    number: 4,
    operational: true,
    antenna_id: 1,
    frequency: 1000,
    bandwidth: 10,
    modulation: 'BPSK',
    fec: '1/2',
  },
  {
    id: 5,
    server_id: 1,
    team_id: 1,
    unit: 2,
    number: 1,
    operational: true,
    antenna_id: 1,
    frequency: 1000,
    bandwidth: 10,
    modulation: 'BPSK',
    fec: '1/2',
  },
  {
    id: 6,
    server_id: 1,
    team_id: 1,
    unit: 2,
    number: 2,
    operational: true,
    antenna_id: 1,
    frequency: 1000,
    bandwidth: 10,
    modulation: 'BPSK',
    fec: '1/2',
  },
  {
    id: 7,
    server_id: 1,
    team_id: 1,
    unit: 2,
    number: 3,
    operational: true,
    antenna_id: 1,
    frequency: 1000,
    bandwidth: 10,
    modulation: 'BPSK',
    fec: '1/2',
  },
  {
    id: 8,
    server_id: 1,
    team_id: 1,
    unit: 2,
    number: 4,
    operational: true,
    antenna_id: 1,
    frequency: 1000,
    bandwidth: 10,
    modulation: 'BPSK',
    fec: '1/2',
  },
  {
    id: 9,
    server_id: 1,
    team_id: 1,
    unit: 3,
    number: 1,
    operational: true,
    antenna_id: 1,
    frequency: 1000,
    bandwidth: 10,
    modulation: 'BPSK',
    fec: '1/2',
  },
  {
    id: 10,
    server_id: 1,
    team_id: 1,
    unit: 3,
    number: 2,
    operational: true,
    antenna_id: 1,
    frequency: 1000,
    bandwidth: 10,
    modulation: 'BPSK',
    fec: '1/2',
  },
  {
    id: 11,
    server_id: 1,
    team_id: 1,
    unit: 3,
    number: 3,
    operational: true,
    antenna_id: 1,
    frequency: 1000,
    bandwidth: 10,
    modulation: 'BPSK',
    fec: '1/2',
  },
  {
    id: 12,
    server_id: 1,
    team_id: 1,
    unit: 3,
    number: 4,
    operational: true,
    antenna_id: 1,
    frequency: 1000,
    bandwidth: 10,
    modulation: 'BPSK',
    fec: '1/2',
  },
  {
    id: 13,
    server_id: 1,
    team_id: 1,
    unit: 4,
    number: 1,
    operational: true,
    antenna_id: 1,
    frequency: 1000,
    bandwidth: 10,
    modulation: 'BPSK',
    fec: '1/2',
  },
  {
    id: 14,
    server_id: 1,
    team_id: 1,
    unit: 4,
    number: 2,
    operational: true,
    antenna_id: 1,
    frequency: 1000,
    bandwidth: 10,
    modulation: 'BPSK',
    fec: '1/2',
  },
  {
    id: 15,
    server_id: 1,
    team_id: 1,
    unit: 4,
    number: 3,
    operational: true,
    antenna_id: 1,
    frequency: 1000,
    bandwidth: 10,
    modulation: 'BPSK',
    fec: '1/2',
  },
  {
    id: 16,
    server_id: 1,
    team_id: 1,
    unit: 4,
    number: 4,
    operational: true,
    antenna_id: 1,
    frequency: 1000,
    bandwidth: 10,
    modulation: 'BPSK',
    fec: '1/2',
  },
];

export const useRx = () => {
  return useContext(rxContext);
};

export const useUpdateRx = () => {
  return useContext(updateRxContext);
};

export const RxProvider = ({ children }) => {
  const [rx, setRx] = useState(defaultRxContext);

  window.sewApp.socket.on('updateRxClient', data => {
    if (data.user != window.sewApp.socket.id) {
      console.log('actually updating the Rx');
      let tmpUpdate = [...rx];
      tmpUpdate[data.index] = data.update;
      setRx(tmpUpdate);
    }
  });

  const updateRx = (update, index) => {
    let tmpUpdate = [...rx];
    tmpUpdate[index] = update;
    // patch request to update database
    // if patch request is good
    console.log('updating the Rx');
    window.sewApp.socket.emit('updateRx', { user: window.sewApp.socket.id, update: update, index: index });
    setRx(tmpUpdate);
  };

  return (
    <rxContext.Provider value={rx}>
      <updateRxContext.Provider value={updateRx}>{children}</updateRxContext.Provider>
    </rxContext.Provider>
  );
};

RxProvider.propTypes = {
  children: PropTypes.any,
};
