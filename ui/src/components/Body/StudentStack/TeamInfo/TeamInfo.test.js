import React from 'react';
import { render, screen } from '@testing-library/react';
import { TeamInfo } from './TeamInfo';
import { SewAppProvider } from '../../../../context/sewAppContext';

window.sewApp = {
  teamInfo: {
    team: 'blue',
  },
};

test('renders server and team name', () => {
  render(
    <SewAppProvider>
      <TeamInfo />
    </SewAppProvider>
  );
  expect(screen.getByText(/Team/i)).toBeInTheDocument();
  expect(screen.getByText(/Server/i)).toBeInTheDocument();
});
