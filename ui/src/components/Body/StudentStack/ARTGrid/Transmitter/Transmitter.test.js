import React from 'react';
import { render } from '@testing-library/react';
import { Transmitter } from './Transmitter';
import { TxProvider } from '../../../../../context';

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
      <TxProvider>
        <Transmitter />
      </TxProvider>
    );
    expect(() => result).not.toThrow();
  });
});
