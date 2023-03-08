import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { RuxTooltip, RuxButton } from '@astrouxds/react'
import { selectSound } from '../../../../../../audio';
import { useSound } from 'use-sound';



export const TxModemButton = ({ modemId, updateActiveModem, isActive, isTransmitting }) => {
  const [playSelectSound] = useSound(selectSound);
  const el = useRef(null)
  useEffect(()=>{
    isActive ? el.current.classList.add('isActive') : el.current.classList.remove('isActive')
    isTransmitting ? el.current.classList.add('isTransmitting') : el.current.classList.remove('isTransmitting')
  }, [isActive, isTransmitting])

  return (
    <RuxTooltip message={'Transmit Modem ' + modemId.toString()}>
      <RuxButton onClick={()=>{
            playSelectSound();
            updateActiveModem(modemId);
      }} ref={el} secondary>{modemId}</RuxButton>
    </RuxTooltip>
  );
};

TxModemButton.propTypes = {
  modemId: PropTypes.number.isRequired,
  isTransmitting: PropTypes.bool.isRequired,
  isActive: PropTypes.bool.isRequired,
  updateActiveModem: PropTypes.func.isRequired,
};
