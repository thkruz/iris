import React from 'react';
import { render } from '@testing-library/react';
import { Transmitter } from './Transmitter';
import { SewAppProvider } from '../../../../../context/sewAppContext';

describe('Transmitter', () => {
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
        <Transmitter />
      </SewAppProvider>
    );
    expect(() => result).not.toThrow();
  });
});
