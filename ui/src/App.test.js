import React from 'react';
import { render } from '@testing-library/react';
import App from './App';
import { SewAppProvider } from './context/sewAppContext';
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
      <SewAppProvider>
        <App />
      </SewAppProvider>
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
