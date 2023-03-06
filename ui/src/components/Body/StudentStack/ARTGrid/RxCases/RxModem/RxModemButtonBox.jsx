import React from 'react';
import { RuxCard } from '@astrouxds/react'
import PropTypes from 'prop-types';
// import { Box } from '@mui/material';
// import { sxModemButtonBox } from '../../../../../styles';
import { RxModemButton } from './RxModemButton';

export const RxModemButtonBox = ({ unitData, unit, activeModem, updateActiveModem }) => {
  return (
    <RuxCard width={80}>
      {unitData
        .sort((a, b) => a.id - b.id)
        .map((x, index) => {
          if (x.unit == unit)
            return (
              <RxModemButton
                key={index}
                modemId={x.modem_number}
                isActive={x.modem_number === activeModem}
                updateActiveModem={updateActiveModem}
              />
            );
        })}
    </RuxCard>
  );
};
RxModemButtonBox.propTypes = {
  unit: PropTypes.number,
  unitData: PropTypes.array,
  activeModem: PropTypes.number,
  updateActiveModem: PropTypes.func.isRequired,
};
