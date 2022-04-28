import React from 'react';
import { render } from '@testing-library/react';
import { TxModem } from './TxModem';

test('renders server and team name', () => {
  render(<TxModem />);
});
