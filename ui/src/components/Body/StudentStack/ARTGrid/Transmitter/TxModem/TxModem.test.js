import React from 'react';
import { render } from '@testing-library/react';
import { TxModem } from './TxModem';
import { tmpRxData } from './../../Receiver/tmpRxData';

test('renders server and team name', () => {
  render(<TxModem unit={1} tmpTxData={tmpRxData.filter(y => y.unit === 1)} />);
});
