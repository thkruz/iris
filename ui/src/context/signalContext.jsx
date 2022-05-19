import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import config from './../config';
const signalContext = React.createContext();
const updateSignalContext = React.createContext();

export const useSignal = () => {
  return useContext(signalContext);
};

export const useUpdateSignal = () => {
  return useContext(updateSignalContext);
};

export const SignalProvider = ({ children }) => {
  const [signal, setSignal] = useState(null);
  const updateSignal = update => {
    setSignal(update);
  };

  useEffect(() => {
    const ApiUrl = config[process.env.REACT_APP_NODE_ENV || 'development'].apiUrl;
    fetch(`${ApiUrl}/data/signal`)
      .then(response => response.json())
      .then(data => {
        console.log('SignalProvider', data);
        window.sewApp.environment.setSignals(data);
        setSignal([...data]);
      });
  }, []);

  return (
    <signalContext.Provider value={signal}>
      <updateSignalContext.Provider value={updateSignal}>{children}</updateSignalContext.Provider>
    </signalContext.Provider>
  );
};

SignalProvider.propTypes = {
  children: PropTypes.any,
};
