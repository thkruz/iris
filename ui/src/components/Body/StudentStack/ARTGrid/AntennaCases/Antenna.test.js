import React from 'react';
import { render } from '@testing-library/react';
import { Antenna } from './Antenna';
import { SewAppProvider } from '../../../../../context/sewAppContext';

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
      <SewAppProvider>
        <Antenna />
      </SewAppProvider>
    );
    expect(() => result).not.toThrow();
  });
});
