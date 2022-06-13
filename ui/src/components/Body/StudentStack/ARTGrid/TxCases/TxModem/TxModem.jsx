/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Grid } from '@mui/material';
import './TxModem.css';
import { useSewApp } from '../../../../../../context/sewAppContext';
import { TxModemButtonBox } from './TxModemButtonBox';
import { TxModemInput } from './TxModemInput';
import { useEffect } from 'react';

export const TxModem = ({ unit }) => {
  const [activeModem, setActiveModem] = useState(1);
  const [currentRow, setCurrentRow] = useState(1);
  const sewAppCtx = useSewApp();
  const unitData = sewAppCtx.tx.filter(
    x => x.unit == unit && x.team_id == sewAppCtx.user.team_id && x.server_id == sewAppCtx.user.server_id
  );

  const updateActiveModem = modem => {
    setActiveModem(modem);
  };

  useEffect(() => {
    const currentModem = unitData.find(x => {
      return x.modem_number == activeModem;
    });
    const _currentRow = sewAppCtx.tx.findIndex(x => x.id == currentModem.id);
    setCurrentRow(_currentRow);
  }, [activeModem]);

  return (
    <Grid container>
      <Grid item xs={'auto'}>
        <TxModemButtonBox
          unitData={unitData}
          activeModem={activeModem}
          unit={unit}
          updateActiveModem={updateActiveModem}
        />
      </Grid>
      <Grid item xs={true}>
        <TxModemInput unitData={unitData} activeModem={activeModem} currentRow={currentRow} />
      </Grid>
    </Grid>
  );
};

TxModem.propTypes = {
  unit: PropTypes.number,
};
