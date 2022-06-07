import React from 'react';
import { render } from '@testing-library/react';
import { AnalyzerControl } from './AnalyzerControl';
import { SewAppProvider } from '../../../../../context/sewAppContext';

export const hideErrors = () => {
  jest.spyOn(console, 'error');
  console.error.mockImplementation(() => {});
};

export const restoreErrors = () => console.error.mockRestore();

describe.skip('AnalyzerControl', () => {
  const currentSpecAnalyzer = {
    canvas: {
      id: 'spec-analyzer-1',
    },
    changeCenterFreq: jest.fn(),
    changeBandwidth: jest.fn(),
    resetHoldData: jest.fn(),
  };
  const handleBackgroundClick = jest.fn();
  const setupSpecAnalyzer = () =>
    render(
      <SewAppProvider>
        <AnalyzerControl currentSpecAnalyzer={currentSpecAnalyzer} handleBackgroundClick={handleBackgroundClick} />
      </SewAppProvider>
    );

  it('should require props', () => {
    hideErrors();
    const result = () => {
      render(<AnalyzerControl />);
    };
    expect(result).toThrow();
    restoreErrors();
  });

  it('should render', () => {
    expect(setupSpecAnalyzer).not.toThrowError();
  });

  it('should have functioning buttons', () => {
    const SpecA = setupSpecAnalyzer();

    // NOTE: ‹ is not < symbol!
    const buttonGhz = SpecA.queryAllByRole('button').filter(b => b.textContent === '‹')[0];
    const buttonMhz = SpecA.queryAllByRole('button').filter(b => b.textContent === '‹')[1];
    const buttonKhz = SpecA.queryAllByRole('button').filter(b => b.textContent === '‹')[2];

    const button7 = SpecA.getByText('7');
    button7.click();
    buttonGhz.click();
    const button8 = SpecA.getByText('8');
    button8.click();
    const button9 = SpecA.getByText('9');
    button9.click();
    const button4 = SpecA.getByText('4');
    button4.click();
    buttonMhz.click();
    const button5 = SpecA.getByText('5');
    button5.click();
    const button6 = SpecA.getByText('6');
    button6.click();
    const button1 = SpecA.getByText('1');
    button1.click();
    const button2 = SpecA.getByText('2');
    button2.click();
    buttonKhz.click();
    const button3 = SpecA.getByText('3');
    button3.click();
    const button0 = SpecA.queryAllByRole('button').find(b => b.textContent === '0');
    button0.click();
    const buttonDot = SpecA.getByText('.');
    buttonDot.click();
    const buttonClear = SpecA.getByText('C');
    buttonClear.click();
    const buttonMinus = SpecA.getByText('-');
    buttonMinus.click();
    const buttonBksp = SpecA.getByText('bskp');
    buttonBksp.click();

    const buttonFreq = SpecA.getByText('Freq');
    buttonFreq.click();
    const buttonSpan = SpecA.getByText('Span');
    buttonSpan.click();
    const buttonTrace = SpecA.getByText('Trace');
    buttonTrace.click();
    const buttonMarker = SpecA.getByText('Marker');
    buttonMarker.click();
  });

  it('should have a working frequency selection button', () => {
    const SpecA = setupSpecAnalyzer();
    const buttonFreq = SpecA.getByText('Freq');
    // NOTE: ‹ is not < symbol!
    const buttonGhz = SpecA.queryAllByRole('button').filter(b => b.textContent === '‹')[0];
    const buttonMhz = SpecA.queryAllByRole('button').filter(b => b.textContent === '‹')[1];
    const buttonKhz = SpecA.queryAllByRole('button').filter(b => b.textContent === '‹')[2];

    buttonFreq.click();
    buttonGhz.click();
    buttonFreq.click();
    buttonMhz.click();
    buttonFreq.click();
    buttonKhz.click();
    buttonFreq.click();
  });

  it('should have a working span selection button', () => {
    const SpecA = setupSpecAnalyzer();
    const buttonSpan = SpecA.getByText('Span');
    // NOTE: ‹ is not < symbol!
    const buttonGhz = SpecA.queryAllByRole('button').filter(b => b.textContent === '‹')[0];
    const buttonMhz = SpecA.queryAllByRole('button').filter(b => b.textContent === '‹')[1];
    const buttonKhz = SpecA.queryAllByRole('button').filter(b => b.textContent === '‹')[2];

    buttonSpan.click();
    buttonGhz.click();
    buttonSpan.click();
    buttonMhz.click();
    buttonSpan.click();
    buttonKhz.click();
    buttonSpan.click();
  });

  it('should have a working bksp', () => {
    const SpecA = setupSpecAnalyzer();
    // NOTE: ‹ is not < symbol!
    const buttonGhz = SpecA.queryAllByRole('button').filter(b => b.textContent === '‹')[0];
    const buttonMhz = SpecA.queryAllByRole('button').filter(b => b.textContent === '‹')[1];
    const buttonKhz = SpecA.queryAllByRole('button').filter(b => b.textContent === '‹')[2];
    const buttonBksp = SpecA.getByText('bskp');
    const button2 = SpecA.getByText('2');
    const buttonDot = SpecA.getByText('.');
    const buttonClear = SpecA.getByText('C');

    buttonKhz.click();
    button2.click();
    buttonBksp.click();
    buttonDot.click();
    buttonClear.click();
    buttonMhz.click();
    button2.click();
    buttonBksp.click();
    buttonDot.click();
    buttonClear.click();
    buttonGhz.click();
    button2.click();
    buttonBksp.click();
    buttonDot.click();
    buttonClear.click();
  });
});
