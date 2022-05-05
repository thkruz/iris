import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { AntennaProvider, RxProvider, TxProvider } from './context';
import reportWebVitals from './reportWebVitals';
import './index.css';
import { RfEnvironment } from './RfEnvironment';

// Create a sync global context for the RF Environments
window.sewApp = {
  environment: new RfEnvironment(),
  getSpectrumAnalyzer: i => {
    if (i === 1) return window.sewApp.specA1;
    if (i === 2) return window.sewApp.specA2;
    if (i === 3) return window.sewApp.specA3;
    if (i === 4) return window.sewApp.specA4;
  },
};

ReactDOM.render(
  <React.StrictMode>
    <AntennaProvider>
      <RxProvider>
        <TxProvider>
          <App />
        </TxProvider>
      </RxProvider>
    </AntennaProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
