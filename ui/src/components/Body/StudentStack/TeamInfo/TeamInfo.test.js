import React from 'react';
import { render, screen } from '@testing-library/react';
import { TeamInfo } from './TeamInfo';

window.sewApp = {
  teamInfo: {
    team: 'blue',
  },
};

test('renders server and team name', () => {
  render(<TeamInfo />);
  expect(screen.getByText(/Team/i)).toBeInTheDocument();
  expect(screen.getByText(/Server/i)).toBeInTheDocument();
});
