import React from 'react';
import { render } from '@testing-library/react';
import { Antenna } from './Antenna';
import { AntennaProvider, RxProvider, SignalProvider } from '../../../../../context';

describe('Antenna', () => {
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
          <AntennaProvider>
            <Antenna />
          </AntennaProvider>
        </RxProvider>
      </SignalProvider>
    );
    expect(() => result).not.toThrow();
  });
});
