import React from 'react';
import { render, screen } from '@testing-library/react';
import { Header } from './Header';

test('renders learn react link', () => {
  render(<Header />);
  const titleElement = screen.getByText(/Iris/i);
  expect(titleElement).toBeInTheDocument();
});