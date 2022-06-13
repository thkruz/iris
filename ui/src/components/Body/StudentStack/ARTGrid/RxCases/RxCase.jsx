import React from 'react';
import { RxModem } from '../../../..';
import { Grid, Tooltip } from '@mui/material';
import { EquipmentCase } from '../EquipmentCase';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import { AstroTheme } from '../../../../../themes/AstroTheme';
import { useSewApp } from './../../../../../context/sewAppContext';
import { PropTypes } from 'prop-types';
import RxCaseHelp from '../../HelpModals/RxCaseHelp';

export const RxCase = ({ unit }) => {
  const sewAppCtx = useSewApp();

  const determineEquipmentStatus = (unit) => {
    const currentModems = sewAppCtx.rx.filter(
      (rx) =>
        rx.unit === (unit - 1) * 4 + 1 ||
        rx.unit === (unit - 1) * 4 + 2 ||
        rx.unit === (unit - 1) * 4 + 3 ||
        rx.unit === (unit - 1) * 4 + 4
    );
    const isFound = currentModems.filter((rx) => rx.found).length > 0;
    const isDegraded = currentModems.filter((rx) => rx.degraded).length > 0;
    const isDenied = currentModems.filter((rx) => rx.denied).length > 0;

    let color = '';
    let description = '';
    if (isFound && !isDegraded && !isDenied) {
      color = AstroTheme.palette.success.main;
      description = 'Signal Found';
    } else if (isFound && isDegraded && !isDenied) {
      color = AstroTheme.palette.warning.main;
      description = 'Signal Degraded';
    } else if (isFound && isDenied) {
      color = AstroTheme.palette.critical.main;
      description = 'Signal Denied';
    } else {
      color = AstroTheme.palette.standby.main;
      description = 'Signal Not Found';
    }
    return {
      color,
      description,
    };
  };

  const { color, description } = determineEquipmentStatus(unit);
  return (
    <Grid item xs={true} minWidth={650} key={unit}>
      <EquipmentCase
        helpTitle='Reciever Modem Help'
        helpComponent={RxCaseHelp}
        unit={unit}
        icon={
          <Tooltip title={description}>
            <SignalCellularAltIcon sx={{ color: color }} />
          </Tooltip>
        }>
        <RxModem unit={unit} />
      </EquipmentCase>
    </Grid>
  );
};
RxCase.propTypes = {
  unit: PropTypes.number.isRequired,
};
