import React, { useState } from 'react';
import { Grid, Tooltip } from '@mui/material';
import { AntennaController } from '../../../..';
import { EquipmentCase } from '../EquipmentCase';
import AntennaHelp from '../../HelpModals/AntennaHelp';
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
import { AstroTheme } from '../../../../../themes/AstroTheme';
import { PropTypes } from 'prop-types';
import { useSewApp } from '../../../../../context/sewAppContext';
import { useEffect } from 'react';
import LockIcon from '@mui/icons-material/Lock';

export const AntennaCase = ({ unit }) => {
  const [antColor, setAntColor] = useState(AstroTheme.palette.standby.main);
  const [antState, setAntState] = useState('standby');
  const [lockColor, setLockColor] = useState(AstroTheme.palette.standby.main);
  const [lockState, setLockState] = useState('standby');
  const sewAppCtx = useSewApp();

  useEffect(() => {
    const antenna = sewAppCtx.antenna[unit - 1];
    if (antenna) {
      let _color, _state;

      if (!antenna.operational) {
        _color = AstroTheme.palette.disabled.main;
        _state = 'Not Operational';
      } else {
        if (antenna.loopback || (!antenna.loopback && antenna.hpa)) {
          _color = AstroTheme.palette.success.main;
          if (antenna.loopback) {
            _state = 'Loopback';
          } else {
            _state = 'Actively Transmitting';
          }
        } else {
          _color = AstroTheme.palette.critical.main;
          _state = 'No Power';
        }
      }

      setAntColor(_color);
      setAntState(_state);

      if (antenna.locked) {
        setLockColor(AstroTheme.palette.success.main);
        setLockState('Locked');
      } else if (!antenna.locked && antenna.track) {
        setLockColor(AstroTheme.palette.caution.main);
        setLockState('Tracking');
      } else if (!antenna.locked && !antenna.track) {
        setLockColor(AstroTheme.palette.critical.main);
        setLockState('Unlocked');
      }
    }
  }, [sewAppCtx.antenna]);

  return (
    <Grid xs={true} item minWidth={675}>
      <EquipmentCase
        helpTitle='Antenna'
        helpComponent={AntennaHelp}
        unit={unit}
        icon={
          <>
            <Tooltip title={antState}>
              <SettingsInputAntennaIcon sx={{ color: antColor }} />
            </Tooltip>
            <Tooltip title={lockState}>
              <LockIcon sx={{ color: lockColor }} />
            </Tooltip>
          </>
        }>
        <AntennaController unit={unit} />
      </EquipmentCase>
    </Grid>
  );
};
AntennaCase.propTypes = {
  unit: PropTypes.number.isRequired,
};
