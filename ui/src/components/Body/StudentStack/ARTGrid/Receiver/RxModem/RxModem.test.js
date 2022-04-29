import React from 'react';
import { render } from '@testing-library/react';
import { RxModem } from './RxModem';
import { tmpRxData } from './../tmpRxData';

test('renders server and team name', () => {
  render(<RxModem unit={1} tmpRxData={tmpRxData.filter(y => y.unit === 1)} />);
});
