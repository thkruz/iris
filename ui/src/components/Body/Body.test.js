import React from 'react';
import { render } from '@testing-library/react';
import { Body } from './Body';

describe('Body', () => {
  it('should render', () => {
    const result = render(<Body />);
    expect(() => result).not.toThrow();
  });
});
