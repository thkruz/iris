import React, { useState, useEffect } from 'react';
import { RuxTooltip } from '@astrouxds/react'
import { Grid } from '@mui/material';
import { AntennaController } from '../../../..';
import { EquipmentCase } from '../EquipmentCase';
import AntennaHelp from '../../HelpModals/AntennaHelp';
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
import { PropTypes } from 'prop-types';
import { useSewApp } from '../../../../../context/sewAppContext';
import LockIcon from '@mui/icons-material/Lock';

export const AntennaCase = ({ unit }) => {
  const [antColor, setAntColor] = useState('var(--color-status-standby)');
  const [antState, setAntState] = useState('standby');
  const [lockColor, setLockColor] = useState('var(--color-status-standby)');
  const [lockState, setLockState] = useState('standby');
  const sewAppCtx = useSewApp();

  useEffect(() => {
    const antenna = sewAppCtx.antenna[unit - 1];
    if (antenna) {
      let _color, _state;

      if (!antenna.operational) {
        _color = 'var(--color-status-off)';
        _state = 'Not Operational';
      } else {
        if (antenna.loopback || (!antenna.loopback && antenna.hpa)) {
          _color = 'var(--color-status-normal)';
          if (antenna.loopback) {
            _state = 'Loopback';
          } else {
            _state = 'Actively Transmitting';
          }
        } else {
          _color = 'var(--color-status-critical)';
          _state = 'No Power';
        }
      }

      setAntColor(_color);
      setAntState(_state);

      if (antenna.locked) {
        setLockColor('var(--color-status-normal)');
        setLockState('Locked');
      } else if (!antenna.locked && antenna.track) {
        setLockColor('var(--color-status-standby)');
        setLockState('Tracking');
      } else if (!antenna.locked && !antenna.track) {
        setLockColor('var(--color-status-off)');
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
            <RuxTooltip message={antState}>
              <SettingsInputAntennaIcon sx={{ color: antColor }} />
            </RuxTooltip>
            <RuxTooltip message={lockState}>
              <LockIcon sx={{ color: lockColor }} />
            </RuxTooltip>
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
