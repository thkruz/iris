import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { SewAppProvider } from './context/sewAppContext';
import './index.css';
import '@astrouxds/astro-web-components/dist/astro-web-components/astro-web-components.css'

ReactDOM.render(
  <React.StrictMode>
    <SewAppProvider>
      <App />
    </SewAppProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
