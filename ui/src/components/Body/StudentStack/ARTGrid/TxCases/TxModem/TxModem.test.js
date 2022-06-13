import React from 'react';
import { render } from '@testing-library/react';
import { TxModem } from './TxModem';
import { SewAppProvider } from '../../../../../../context/sewAppContext';
import { defaultTxData } from '../../../../../../constants';

test('renders server and team name', () => {
  render(
    <SewAppProvider>
      <TxModem unit={1} tmpTxData={defaultTxData.filter(y => y.unit === 1)} />
    </SewAppProvider>
  );
});
