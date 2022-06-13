import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Grid } from '@mui/material';
import './RxModem.css';
import { useSewApp } from '../../../../../../context/sewAppContext';
import { RxModemButtonBox } from './RxModemButtonBox';
import { RxModemInput } from './RxModemInput';
import { RxVideo } from './RxVideo';

export const RxModem = ({ unit }) => {
  const [activeModem, setActiveModem] = useState(1);
  const [currentRow, setCurrentRow] = useState(1);
  const sewAppCtx = useSewApp();
  const unitData = sewAppCtx.rx.filter(
    (x) => x.unit == unit && x.team_id == sewAppCtx.user.team_id && x.server_id == sewAppCtx.user.server_id
  );

  const updateActiveModem = (modem) => {
    setActiveModem(modem);
  };

  useEffect(() => {
    const currentModem = unitData.find((x) => x.modem_number == activeModem);
    const _currentRow = sewAppCtx.rx.findIndex((x) => x.id == currentModem.id);
    setCurrentRow(_currentRow);
  }, [activeModem]);

  return (
    <Grid container>
      <Grid item xs={'auto'}>
        <RxModemButtonBox
          unitData={unitData}
          activeModem={activeModem}
          unit={unit}
          updateActiveModem={updateActiveModem}
        />
      </Grid>
      <Grid container item xs={true}>
        <Grid item xs={7}>
          <RxModemInput unitData={unitData} activeModem={activeModem} currentRow={currentRow} />
        </Grid>
        <Grid item xs={5}>
          <RxVideo currentRow={currentRow} />
        </Grid>
      </Grid>
    </Grid>
  );
};

RxModem.propTypes = {
  unit: PropTypes.number,
  tmpRxData: PropTypes.array,
};
