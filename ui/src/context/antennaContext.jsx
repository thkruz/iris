import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
const antennaContext = React.createContext();
const updateAntennaContext = React.createContext();

const url = config[process.env.REACT_APP_NODE_ENV || 'development'].apiUrl;

const defaultAntennaContext = [
  {
    id: 1,
    server_id: 1,
    team_id: 1,
    target_id: 1,
    unit: 1,
    operational: true,
    locked: true,
    band: 0,
    offset: 0,
    hpa: false,
    loopback: true,
  },
  {
    id: 2,
    server_id: 1,
    team_id: 1,
    target_id: 2,
    unit: 2,
    operational: true,
    locked: true,
    band: 0,
    offset: 0,
    hpa: false,
    loopback: true,
  },
];

export const useAntenna = () => {
  return useContext(antennaContext);
};

export const useUpdateAntenna = () => {
  return useContext(updateAntennaContext);
};

export const AntennaProvider = ({ children }) => {
  const [antenna, setAntenna] = useState(defaultAntennaContext);

  window.sewApp.socket.on('updateAntennaClient', data => {
    if (data.user != window.sewApp.socket.id) {
      setAntenna(data.signals);
    }
  });

  const updateAntenna = update => {
    console.log('updateAntenna', update);
    // send patch request to server

    // I think we're going to need to attach ?id={$id} to the end of the url
    axios.patch(`${url}/data/antenna`, update)
      .then(res => {
        console.log(res);
        if (res.status === 200) {
          window.sewApp.socket.emit('updateAntenna', { user: window.sewApp.socket.id, signals: update });
          setAntenna(update);
        }
        else {
          console.log('error patching antenna');
          window.alert("Error patching antenna");
        }
      })
      .catch(err => {
        console.log("Error patching receiver", err);
      });
  };

  return (
    <antennaContext.Provider value={antenna}>
      <updateAntennaContext.Provider value={updateAntenna}>{children}</updateAntennaContext.Provider>
    </antennaContext.Provider>
  );
};

AntennaProvider.propTypes = {
  children: PropTypes.any,
};
