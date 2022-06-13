import React from 'react';
import { render } from '@testing-library/react';
import { RxModem } from './RxModem';
import { SewAppProvider } from '../../../../../../context/sewAppContext';
import { defaultRxData } from '../../../../../../constants';

test('renders server and team name', () => {
  render(
    <SewAppProvider>
      <RxModem unit={1} tmpRxData={defaultRxData.filter(y => y.unit === 1)} />
    </SewAppProvider>
  );
});
