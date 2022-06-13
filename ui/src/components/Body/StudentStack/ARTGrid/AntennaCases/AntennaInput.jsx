import React, { useEffect, useState } from 'react';
import Switch from '@mui/material/Switch';
import PropTypes from 'prop-types';
import { Typography, Button, Grid, Box, Tooltip } from '@mui/material';
import { AstroTheme } from '../../../../../themes/AstroTheme';
import { useSewApp } from '../../../../../context/sewAppContext';
import { antennas, satellites } from '../../../../../constants';
import { CRUDdataTable } from '../../../../../crud/crud';
import { sxModalError, sxValues, sxValuesGrid } from '../../../../styles';
import { breakerSound, errorSound, selectSound } from '../../../../../audio';
import useSound from 'use-sound';

const DELAY_TO_ACQ_LOCK = 5000;
const popupTimeoutTime = 3000;
let errorResetTimeout;

let trackTimeout = null;
export const AntennaInput = ({ unit }) => {
  const [isErrorActive, setErrorActive] = useState(false);
  const [playErrorSound] = useSound(errorSound);
  const [playSelectSound] = useSound(selectSound);
  const [playBreakerSound] = useSound(breakerSound);
  const sewAppCtx = useSewApp();
  const unitData = sewAppCtx.antenna.filter(
    (x) => x.unit == unit && x.team_id == sewAppCtx.user.team_id && x.server_id == sewAppCtx.user.server_id
  );
  const antennaIdx = sewAppCtx.antenna.map((x) => x.id).indexOf(unitData[0].id);
  const [inputData, setInputData] = useState(sewAppCtx.antenna[antennaIdx]);

  const sxButton = {
    backgroundColor: AstroTheme.palette.tertiary.light3,
    boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.75)',
    color: 'black',
    cursor: 'pointer',
  };

  const sxEnable = {
    marginLeft: '10px',
    border: '1px solid red',
    backgroundColor: inputData.operational ? 'red' : AstroTheme.palette.tertiary.light3,
    color: inputData.operational ? 'white' : 'black',
    '&:hover': {
      backgroundColor: inputData.operational ? AstroTheme.palette.error.main : AstroTheme.palette.critical.main,
      color: inputData.operational ? 'black' : 'white',
    },
  };

  useEffect(() => {
    setInputData(sewAppCtx.antenna[antennaIdx]);
  }, [sewAppCtx.antenna]);

  const handleInputChange = ({ param, val }) => {
    if (param === 'offset') {
      // if contains any symbols except - and number then return
      if (val.match(/[^0-9-]/g)) return;
      if (!isNaN(parseInt(val))) {
        val = parseInt(val);
      }
    } else {
      val = parseInt(val);
    }
    const tmpInputData = { ...inputData };
    tmpInputData[param] = val;
    setInputData(tmpInputData);
  };

  const handleTrackLocked = ({ param, val }) => {
    const tmpData = [...sewAppCtx.antenna];
    tmpData[antennaIdx][param] = val;
    sewAppCtx.updateAntenna([...tmpData]);
    CRUDdataTable({ method: 'PATCH', path: 'antenna', data: tmpData[antennaIdx] });
  };

  const handleApply = () => {
    playSelectSound();
    const tmpData = [...sewAppCtx.antenna];
    tmpData[antennaIdx] = inputData;
    sewAppCtx.updateAntenna([...tmpData]);
    CRUDdataTable({ method: 'PATCH', path: 'antenna', data: tmpData[antennaIdx] });
  };

  const handleEnable = () => {
    playBreakerSound();
    const tmpData = [...sewAppCtx.antenna];
    tmpData[antennaIdx].operational = !tmpData[antennaIdx].operational;
    // Cant track if it is off
    if (!tmpData[antennaIdx].operational) {
      tmpData[antennaIdx].locked = false;
      tmpData[antennaIdx].track = false;
    }
    sewAppCtx.updateAntenna([...tmpData]);
    CRUDdataTable({ method: 'PATCH', path: 'antenna', data: tmpData[antennaIdx] });
  };

  return (
    <>
      {isErrorActive ? (
        <Box sx={sxModalError}>
          <Typography>Antenna is currently not operational. Try enabling it first!</Typography>
        </Box>
      ) : null}
      <Grid container mt={1} pb={2} height={'100%'}>
        <Grid container item xs={12} spacing={0.5}>
          <Grid container item xs={12}>
            <Grid item xs={2}>
              <Typography textAlign={'right'}>Target</Typography>
            </Grid>
            <Grid item xs={true}>
              <select
                name='Target'
                value={inputData.target_id}
                onChange={(e) => handleInputChange({ param: 'target_id', val: e.target.value })}>
                {satellites.map((x, index) => {
                  return (
                    <option value={x.id} key={index}>
                      {x.name}
                    </option>
                  );
                })}
              </select>
            </Grid>
            <Grid item xs={1}></Grid>
            <Grid item xs={true} sx={sxValuesGrid}>
              <Typography sx={sxValues}>{satellites[sewAppCtx.antenna[antennaIdx].target_id - 1].name}</Typography>
            </Grid>
          </Grid>
          <Grid container item xs={12}>
            <Grid item xs={2}>
              <Typography textAlign={'right'}>Band</Typography>
            </Grid>
            <Grid item xs={true}>
              <select
                name='band'
                value={inputData.band}
                onChange={(e) => handleInputChange({ param: 'band', val: e.target.value })}>
                {antennas.map((x, index) => {
                  return (
                    <option value={index} key={index}>
                      {x.band}
                    </option>
                  );
                })}
              </select>
            </Grid>
            <Grid item xs={1}></Grid>
            <Grid item xs={true} sx={sxValuesGrid}>
              <Typography sx={sxValues}>{antennas[sewAppCtx.antenna[antennaIdx]?.band]?.band}</Typography>
            </Grid>
          </Grid>
          <Grid container item xs={12}>
            <Grid item xs={2}>
              <Typography textAlign={'right'}>Offset</Typography>
            </Grid>
            <Grid item xs={true}>
              <input
                name='offset'
                type='text'
                value={inputData.offset}
                onChange={(e) => {
                  handleInputChange({ param: 'offset', val: e.target.value });
                }}></input>
            </Grid>
            <Grid item xs={1}></Grid>
            <Grid item xs={true} sx={sxValuesGrid}>
              <Typography sx={sxValues}>{sewAppCtx.antenna[antennaIdx].offset + ' MHz'}</Typography>
            </Grid>
          </Grid>
          <Grid container item xs={12}>
            <Grid item xs={2} display={'flex'} alignItems={'center'} justifyContent={'right'}>
              <Typography textAlign={'right'}>Auto-Track</Typography>
            </Grid>
            <Grid item xs={true}>
              <Switch
                checked={inputData.track}
                onChange={() => {
                  if (!inputData.operational) {
                    setErrorActive(true);
                    playErrorSound();
                    if (errorResetTimeout) clearTimeout(errorResetTimeout);
                    errorResetTimeout = setTimeout(() => {
                      setErrorActive(false);
                    }, popupTimeoutTime);
                    return;
                  }
                  const newValue = !inputData.track;
                  playBreakerSound();
                  handleTrackLocked({ param: 'track', val: newValue });
                  if (trackTimeout) clearTimeout(trackTimeout);
                  trackTimeout = setTimeout(
                    () => {
                      handleTrackLocked({ param: 'locked', val: newValue });
                    },
                    newValue ? DELAY_TO_ACQ_LOCK : 0
                  );
                }}></Switch>
            </Grid>
            <Grid item xs={1}></Grid>
            <Grid item xs={true}></Grid>
          </Grid>
        </Grid>
        <Grid
          item
          xs={12}
          textAlign='right'
          alignItems={'flex-end'}
          justifyContent={'flex-end'}
          flexGrow={true}
          display={'flex'}>
          <Tooltip title='Commit Changes'>
            <Button sx={sxButton} onClick={(e) => handleApply(e)}>
              Apply
            </Button>
          </Tooltip>
          <Tooltip title={!sewAppCtx.antenna[antennaIdx]?.operational ? 'Enable Antenna' : 'Disable Antenna'}>
            <Button sx={{ ...sxButton, ...sxEnable }} onClick={(e) => handleEnable(e)}>
              {sewAppCtx.antenna[antennaIdx]?.operational ? 'Power' : 'Power'}
            </Button>
          </Tooltip>
        </Grid>
      </Grid>
    </>
  );
};
AntennaInput.propTypes = {
  unit: PropTypes.number.isRequired,
};
