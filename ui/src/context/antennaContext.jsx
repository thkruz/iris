import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { updateSpecAwAntennaInfo } from './../components/Body/StudentStack/SpectrumAnalyzerGrid/SpectrumAnalyzer/SpectrumAnalyzerBox';
const antennaContext = React.createContext();
const updateAntennaContext = React.createContext();

const defaultAntennaContext = [
  { id: 1, server_id: 1, team_id: 1, target_id: 1, unit: 1, operational: true, locked: true, band: 0, offset: 0, hpa: false, loopback: true },
  { id: 2, server_id: 1, team_id: 1, target_id: 2, unit: 2, operational: true, locked: true, band: 0, offset: 0, hpa: false, loopback: true },
];

export const useAntenna = () => {
  return useContext(antennaContext);
};

export const useUpdateAntenna = () => {
  return useContext(updateAntennaContext);
};

export const AntennaProvider = ({ children }) => {
  const [antenna, setAntenna] = useState(defaultAntennaContext);
  
  window.sewApp.socket.on('updateAntennaClient', (data) => {
    console.log('updateAntennaClient', data);
    if (data.user != window.sewApp.socket.id) {
        console.log('actually updating the antenna');
        setAntenna(data.signals);
    }
});
  
  const updateAntenna = update => {
    for (let i = 1; i <= 4; i++) {
      const specA = window.sewApp.getSpectrumAnalyzer(i);
      updateSpecAwAntennaInfo(specA.antennaId, specA, update);
    }
    console.log('updateAntenna');
    window.sewApp.socket.emit('updateAntenna', { user: window.sewApp.socket.id, signals: update });
    setAntenna(update);
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
