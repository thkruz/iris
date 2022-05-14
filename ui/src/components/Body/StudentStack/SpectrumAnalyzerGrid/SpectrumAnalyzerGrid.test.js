import React from 'react';
import { render } from '@testing-library/react';
import { SpectrumAnalyzerGrid } from './SpectrumAnalyzerGrid';
import { AntennaProvider, RxProvider, SignalProvider } from '../../../../context';

describe('SpectrumAnalyzerGrid', () => {
  beforeEach(() => {
    const mockResponse = [
      {
        frequency: '1.0',
        power: '1.0',
        bandwidth: '1.0',
        target_id: '1.0',
      },
    ];
    jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockResponse),
      })
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  beforeAll(() => {
    window.sewApp = {
      socket: {
        on: jest.fn(),
        emit: jest.fn(),
      },
      environment: {
        setSignals: jest.fn(),
      },
      getSpectrumAnalyzer: () => ({
        signals: [],
      }),
    };
  });

  it('should render', () => {
    const result = render(
      <SignalProvider>
        <RxProvider>
          <AntennaProvider>
            <SpectrumAnalyzerGrid />
          </AntennaProvider>
        </RxProvider>
      </SignalProvider>
    );
    expect(() => result).not.toThrow();
  });
});
