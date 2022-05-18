import React from 'react';
import { render } from '@testing-library/react';
import { Receiver } from './Receiver';
import { AntennaProvider, RxProvider, SignalProvider } from '../../../../../context';

describe('Receiver', () => {
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
            <Receiver />
          </AntennaProvider>
        </RxProvider>
      </SignalProvider>
    );
    expect(() => result).not.toThrow();
  });
});
