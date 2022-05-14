import React from 'react';
import { render, screen } from '@testing-library/react';
import { Header } from './Header';
import { MemoryRouter } from 'react-router-dom';

test('renders learn react link', () => {
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );

  const titleElement = screen.getByText(/Iris/i);
  expect(titleElement).toBeInTheDocument();
});
