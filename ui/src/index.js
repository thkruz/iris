import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { AntennaProvider, RxProvider, TxProvider } from './context';
import reportWebVitals from './reportWebVitals';
import './index.css';

// Create a sync global context for the RF Environments
window.sewApp = {};

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
