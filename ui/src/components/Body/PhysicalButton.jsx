import './3d-buttons.css';
import React from 'react';
import { Button } from '@mui/material';
import { PropTypes } from 'prop-types';

export const PhysicalButton = ({ isEnabled, color, onClick, text }) => {
  let sxFront = {};
  let sxEdge = {};
  switch (color) {
    case 'red':
      sxFront = {
        background: isEnabled ? 'var(--color-status-critical)' : '#52667a',
        color: '#fff',
        fontWeight: 'normal',
      };
      sxEdge = {
        background: isEnabled
          ? 'linear-gradient(to left, #dd1313 0%, #700f0f 8%, #700f0f 92%, #dd1313 100%)'
          : 'linear-gradient(to left, #172635 0%, #1f3347 8%, #1f3347 92%, #172635 100%)',
      };
      break;
    case 'green':
    default:
      sxFront = {
        background: isEnabled ? 'var(--color-status-normal)' : '#52667a',
        color: isEnabled ? '#000' : '#fff',
        fontWeight: isEnabled ? 'bold' : 'normal',
      };
      sxEdge = {
        background: isEnabled
          ? 'linear-gradient(to left, #3dc31f 0%, #299012 8%, #299012 92%, #3dc31f 100%)'
          : 'linear-gradient(to left, #172635 0%, #1f3347 8%, #1f3347 92%, #172635 100%)',
      };
      break;
  }

  return (
    <Button className='pushable' onClick={onClick}>
      <span className='shadow'></span>
      <span className='edge' style={sxEdge}></span>
      <span className='front' style={sxFront}>
        {text}
      </span>
    </Button>
  );
};

PhysicalButton.propTypes = {
  isEnabled: PropTypes.bool,
  color: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
};
