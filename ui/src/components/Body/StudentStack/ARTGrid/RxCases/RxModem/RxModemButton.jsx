import React from 'react';
import PropTypes from 'prop-types';
import { Button, Tooltip } from '@mui/material';
import { useSound } from 'use-sound';
import { selectSound } from '../../../../../../audio';
import { sxRxModemButton } from './sxRxModemButton';

export const RxModemButton = ({ modemId, isActive, updateActiveModem }) => {
  const [playSelectSound] = useSound(selectSound);
  return (
    <Tooltip title={`Receive Modem ${modemId}`}>
      <Button
        sx={sxRxModemButton({ isActive })}
        onClick={() => {
          playSelectSound();
          updateActiveModem(modemId);
        }}>
        {modemId}
      </Button>
    </Tooltip>
  );
};
RxModemButton.propTypes = {
  modemId: PropTypes.number.isRequired,
  isActive: PropTypes.bool.isRequired,
  updateActiveModem: PropTypes.func.isRequired,
};
