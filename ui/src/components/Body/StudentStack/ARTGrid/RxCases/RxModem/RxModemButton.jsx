import React from 'react';
import { useEffect, useRef } from 'react';
import { RuxTooltip, RuxButton } from '@astrouxds/react'
import PropTypes from 'prop-types';
// import { Tooltip } from '@mui/material';
import { useSound } from 'use-sound';
import { selectSound } from '../../../../../../audio';
// import { sxRxModemButton } from './sxRxModemButton';

export const RxModemButton = ({ modemId, isActive, updateActiveModem }) => {
  const [playSelectSound] = useSound(selectSound);
  const el = useRef(null)
  useEffect(()=>{
    isActive ? el.current.classList.add('isActive') : el.current.classList.remove('isActive')
  }, [isActive])

  return (
    <RuxTooltip message={`Receive Modem ${modemId}`}>
      <RuxButton
        secondary
        onClick={() => {
          playSelectSound();
          updateActiveModem(modemId);
        }} ref={el}>
        {modemId}
      </RuxButton>
    </RuxTooltip>
  );
};
RxModemButton.propTypes = {
  modemId: PropTypes.number.isRequired,
  isActive: PropTypes.bool.isRequired,
  updateActiveModem: PropTypes.func.isRequired,
};
