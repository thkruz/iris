import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import config from '../config';
const txContext = React.createContext();
const updateTxContext = React.createContext();

const defaultTxContext = [
  {
    id: 1,
    server_id: 1,
    team_id: 1,
    unit: 1,
    modem_number: 1,
    operational: true,
    antenna_id: 1,
    frequency: 1000,
    bandwidth: 10,
    power: -70,
    transmitting: false,
  },
  {
    id: 1,
    server_id: 1,
    team_id: 1,
    unit: 1,
    modem_number: 2,
    operational: true,
    antenna_id: 1,
    frequency: 1000,
    bandwidth: 10,
    power: -70,
    transmitting: false,
  },
  {
    id: 1,
    server_id: 1,
    team_id: 1,
    unit: 1,
    modem_number: 3,
    operational: true,
    antenna_id: 1,
    frequency: 1000,
    bandwidth: 10,
    power: -70,
    transmitting: false,
  },
  {
    id: 1,
    server_id: 1,
    team_id: 1,
    unit: 1,
    modem_number: 4,
    operational: true,
    antenna_id: 1,
    frequency: 1000,
    bandwidth: 10,
    power: -70,
    transmitting: false,
  },
  {
    id: 1,
    server_id: 1,
    team_id: 1,
    unit: 2,
    modem_number: 1,
    operational: true,
    antenna_id: 1,
    frequency: 1000,
    bandwidth: 10,
    power: -70,
    transmitting: false,
  },
  {
    id: 1,
    server_id: 1,
    team_id: 1,
    unit: 2,
    modem_number: 2,
    operational: true,
    antenna_id: 1,
    frequency: 1000,
    bandwidth: 10,
    power: -70,
    transmitting: false,
  },
  {
    id: 1,
    server_id: 1,
    team_id: 1,
    unit: 2,
    modem_number: 3,
    operational: true,
    antenna_id: 1,
    frequency: 1000,
    bandwidth: 10,
    power: -70,
    transmitting: false,
  },
  {
    id: 1,
    server_id: 1,
    team_id: 1,
    unit: 2,
    modem_number: 4,
    operational: true,
    antenna_id: 1,
    frequency: 1000,
    bandwidth: 10,
    power: -70,
    transmitting: false,
  },
  {
    id: 1,
    server_id: 1,
    team_id: 1,
    unit: 3,
    modem_number: 1,
    operational: true,
    antenna_id: 1,
    frequency: 1000,
    bandwidth: 10,
    power: -70,
    transmitting: false,
  },
  {
    id: 1,
    server_id: 1,
    team_id: 1,
    unit: 3,
    modem_number: 2,
    operational: true,
    antenna_id: 1,
    frequency: 1000,
    bandwidth: 10,
    power: -70,
    transmitting: false,
  },
  {
    id: 1,
    server_id: 1,
    team_id: 1,
    unit: 3,
    modem_number: 3,
    operational: true,
    antenna_id: 1,
    frequency: 1000,
    bandwidth: 10,
    power: -70,
    transmitting: false,
  },
  {
    id: 1,
    server_id: 1,
    team_id: 1,
    unit: 3,
    modem_number: 4,
    operational: true,
    antenna_id: 1,
    frequency: 1000,
    bandwidth: 10,
    power: -70,
    transmitting: false,
  },
  {
    id: 1,
    server_id: 1,
    team_id: 1,
    unit: 4,
    modem_number: 1,
    operational: true,
    antenna_id: 1,
    frequency: 1000,
    bandwidth: 10,
    power: -70,
    transmitting: false,
  },
  {
    id: 1,
    server_id: 1,
    team_id: 1,
    unit: 4,
    modem_number: 2,
    operational: true,
    antenna_id: 1,
    frequency: 1000,
    bandwidth: 10,
    power: -70,
    transmitting: false,
  },
  {
    id: 1,
    server_id: 1,
    team_id: 1,
    unit: 4,
    modem_number: 3,
    operational: true,
    antenna_id: 1,
    frequency: 1000,
    bandwidth: 10,
    power: -70,
    transmitting: false,
  },
  {
    id: 1,
    server_id: 1,
    team_id: 1,
    unit: 4,
    modem_number: 4,
    operational: true,
    antenna_id: 1,
    frequency: 1000,
    bandwidth: 10,
    power: -70,
    transmitting: false,
  },
];

export const useTx = () => {
  return useContext(txContext);
};

export const useUpdateTx = () => {
  return useContext(updateTxContext);
};

export const TxProvider = ({ children }) => {
  const [tx, setTx] = useState(defaultTxContext);

  useEffect(() => {
    const ApiUrl = config[process.env.REACT_APP_NODE_ENV || 'development'].apiUrl;
    fetch(`${ApiUrl}/data/transmitter`)
      .then(response => response.json())
      .then(data => {
        console.log('TransmitterProvider', data);
        setTx([...data]);
      });
  }, []);

  window.sewApp.socket.on('updateTxClient', data => {
    if (data.user != window.sewApp.socket.id) {
      console.log('actually updating the Tx');
      setTx(data.signals);
    }
  });
 
  const updateTx = update => {
    window.sewApp.socket.emit('updateTx', { user: window.sewApp.socket.id, signals: update });
    setTx(update);
  };

  return (
    <txContext.Provider value={tx}>
      <updateTxContext.Provider value={updateTx}>{children}</updateTxContext.Provider>
    </txContext.Provider>
  );
};

TxProvider.propTypes = {
  children: PropTypes.any,
};
