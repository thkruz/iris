import React from 'react';
import { render } from '@testing-library/react';
import App from './App';
import { SignalProvider } from './context/signalContext';
import { RxProvider } from './context/rxContext';
import { AntennaProvider } from './context/antennaContext';
import { TxProvider } from './context';
import { RfEnvironment } from './RfEnvironment';

describe('App', () => {
  beforeAll(() => {
    window.sewApp = {
      socket: {
        on: jest.fn(),
        emit: jest.fn(),
      },
    };
  });

  it('should render', () => {
    const result = render(
      <SignalProvider>
        <RxProvider>
          <TxProvider>
            <AntennaProvider>
              <App />
            </AntennaProvider>
          </TxProvider>
        </RxProvider>
      </SignalProvider>
    );
    expect(() => result).not.toThrow();
  });
});

describe('RfEnvironment', () => {
  it('should initialize', () => {
    const result = new RfEnvironment();
    expect(result).toBeTruthy();
  });
});
