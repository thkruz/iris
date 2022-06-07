import React from 'react';
import { render } from '@testing-library/react';
import { RxModem } from './RxModem';
import { tmpRxData } from './../tmpRxData';
import { SewAppProvider } from '../../../../../../context/sewAppContext';

test('renders server and team name', () => {
  render(
    <SewAppProvider>
      <RxModem unit={1} tmpRxData={tmpRxData.filter(y => y.unit === 1)} />
    </SewAppProvider>
  );
});
