import React from 'react';
import PropTypes from 'prop-types';
import { Button, Tooltip } from '@mui/material';
import { AstroTheme } from '../../../../../../themes/AstroTheme';
import { selectSound } from '../../../../../../audio';
import { useSound } from 'use-sound';

const sxTxModemButton = (params) => {
  const { isTransmitting, isActive } = params;
  return {
    backgroundColor: isActive ? AstroTheme.palette.primary.dark : AstroTheme.palette.primary.light2,
    border: isTransmitting ? '2px solid red' : '2px solid ' + AstroTheme.palette.primary.main,
    color: isActive ? 'white' : 'black',
    width: '5px',
    margin: '8px',
    outline: 'none',
    '&:hover': {
      backgroundColor: isActive ? AstroTheme.palette.primary.main : AstroTheme.palette.primary.light,
    },
  };
};

export const TxModemButton = ({ modemId, isTransmitting, isActive, updateActiveModem }) => {
  const [playSelectSound] = useSound(selectSound);
  return (
    <Tooltip title={'Transmit Modem ' + modemId.toString()}>
      <Button
        sx={sxTxModemButton({ isTransmitting, isActive })}
        onClick={() => {
          playSelectSound();
          updateActiveModem(modemId);
        }}>
        {modemId}
      </Button>
    </Tooltip>
  );
};

TxModemButton.propTypes = {
  modemId: PropTypes.number.isRequired,
  isTransmitting: PropTypes.bool.isRequired,
  isActive: PropTypes.bool.isRequired,
  updateActiveModem: PropTypes.func.isRequired,
};
