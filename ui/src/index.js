import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { AntennaProvider, RxProvider, TxProvider, SignalProvider } from './context';
import reportWebVitals from './reportWebVitals';
import './index.css';
import './sewApp';

window.sewApp.init();
document.addEventListener('contextmenu', event => event.preventDefault());

ReactDOM.render(
  <React.StrictMode>
    <SignalProvider>
      <AntennaProvider>
        <RxProvider>
          <TxProvider>
            <App />
          </TxProvider>
        </RxProvider>
      </AntennaProvider>
    </SignalProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
