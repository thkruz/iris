import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { SewAppProvider } from './context/sewAppContext';
import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <SewAppProvider>
      <App />
    </SewAppProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
