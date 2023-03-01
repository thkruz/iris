import React from 'react';
import { RuxContainer } from '@astrouxds/react'
import PropTypes from 'prop-types';
import { Box, Typography, Button, IconButton, Tooltip } from '@mui/material';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import CellTowerIcon from '@mui/icons-material/CellTower';
import AlignHorizontalCenterIcon from '@mui/icons-material/AlignHorizontalCenter';
import { AstroTheme } from '../../../../../themes/AstroTheme';
import { useSewApp } from '../../../../../context/sewAppContext';
import { CRUDdataTable } from '../../../../../crud/crud';
import useSound from 'use-sound';
import { breakerSound, switchSound } from '../../../../../audio';

export const LoopbackSwitch = ({ unit }) => {
  const [playSwitchSound] = useSound(switchSound);
  const [playBreakerSound] = useSound(breakerSound);

  const sewAppCtx = useSewApp();
  const unitData = sewAppCtx.antenna.filter(
    (x) => x.unit == unit && x.team_id == sewAppCtx.user.team_id && x.server_id == sewAppCtx.user.server_id
  );
  const antennaIdx = sewAppCtx.antenna.map((x) => x.id).indexOf(unitData[0].id);

  const sxHPA = {
    marginTop: '5px',
    backgroundColor: sewAppCtx.antenna[antennaIdx].hpa ? 'red' : AstroTheme.palette.tertiary.light3,
    color: sewAppCtx.antenna[antennaIdx].hpa ? 'white' : 'black',
    boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.5)',
    border: '1px solid red',
    '&:hover': {
      backgroundColor: sewAppCtx.antenna[antennaIdx].hpa
        ? AstroTheme.palette.error.main
        : AstroTheme.palette.critical.main,
      color: sewAppCtx.antenna[antennaIdx].hpa ? 'black' : 'white',
    },
  };
  const sxTx = {
    backgroundColor: sewAppCtx.antenna[antennaIdx].loopback
      ? AstroTheme.palette.tertiary.light2
      : sewAppCtx.antenna[antennaIdx].hpa
      ? 'red'
      : 'green',
    borderRadius: '10px',
  };

  const sxLoopback = {
    width: '100px',
    // backgroundColor: AstroTheme.palette.tertiary.light3,
    // border: '1px solid' + AstroTheme.palette.tertiary.light,
    padding: '10px 30px',
    // marginTop: '-1px',
    // marginBottom: '-1px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    // height: 'calc(100% - 20px)',
  };
  const sxLoopbackSwitch = {
    display: 'flex',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const toggleSwitch = () => {
    playSwitchSound();
    const tmpData = [...sewAppCtx.antenna];
    const loopback = tmpData[antennaIdx].loopback;
    tmpData[antennaIdx].loopback = !loopback;
    sewAppCtx.updateAntenna([...tmpData]);
    CRUDdataTable({ method: 'PATCH', path: 'antenna', data: tmpData[antennaIdx] });
  };
  const handleHPA = () => {
    playBreakerSound();
    const tmpData = [...sewAppCtx.antenna];
    const hpa = tmpData[antennaIdx].hpa;
    tmpData[antennaIdx].hpa = !hpa;
    sewAppCtx.updateAntenna([...tmpData]);
    CRUDdataTable({ method: 'PATCH', path: 'antenna', data: tmpData[antennaIdx] });
  };
  return (
    <RuxContainer style={sxLoopback}>
      <Tooltip title='Intermediate Frequency'>
        <Typography align='center'>IF</Typography>
      </Tooltip>
      <Box sx={sxLoopbackSwitch} width={'100%'}>
        <Tooltip title='Loopback'>
          <SettingsBackupRestoreIcon />
        </Tooltip>
        <IconButton
          onClick={toggleSwitch}
          sx={{
            padding: '0px',
            width: '60%',
            '&:hover': {
              cursor: 'pointer',
            },
          }}>
          <img
            src={`baseball_switch${sewAppCtx.antenna[antennaIdx].loopback ? '' : '2'}.png`}
            alt='baseball_switch'
            style={{ width: '100%' }}
          />
        </IconButton>
        <Tooltip title='Antenna'>
          <CellTowerIcon sx={sxTx} />
        </Tooltip>
      </Box>
      <Tooltip title='Ground'>
        <AlignHorizontalCenterIcon />
      </Tooltip>
      <Tooltip
        title={!sewAppCtx.antenna[antennaIdx].hpa ? 'Enable High Powered Amplifier' : 'Disable High Powered Amplifier'}>
        <Button sx={sxHPA} onClick={(e) => handleHPA(e)}>
          <Typography>HPA</Typography>
        </Button>
      </Tooltip>
    </RuxContainer>
  );
};
LoopbackSwitch.propTypes = {
  unit: PropTypes.number.isRequired,
};
