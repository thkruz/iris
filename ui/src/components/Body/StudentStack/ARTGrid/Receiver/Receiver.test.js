import React from 'react';
import { render } from '@testing-library/react';
import { Receiver } from './Receiver';
import { SewAppProvider } from '../../../../../context/sewAppContext';

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
      <SewAppProvider>
        <Receiver />
      </SewAppProvider>
    );
    expect(() => result).not.toThrow();
  });
});
