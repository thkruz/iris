import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { updateSpecAwAntennaInfo } from './../components/Body/StudentStack/SpectrumAnalyzerGrid/SpectrumAnalyzer/SpectrumAnalyzerBox';
const antennaContext = React.createContext();
const updateAntennaContext = React.createContext();

const defaultAntennaContext = [
  { unit: 1, operational: true, id_target: 1, lock: true, band: 1, offset: 0, hpa: false, loopback: true },
  { unit: 2, operational: true, id_target: 1, lock: true, band: 1, offset: 0, hpa: false, loopback: true },
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
