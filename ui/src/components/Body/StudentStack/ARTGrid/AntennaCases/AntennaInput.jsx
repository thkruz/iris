import React, { useEffect, useState } from 'react';
import { RuxButton, RuxPushButton, RuxTooltip, RuxSwitch, RuxNotification, RuxSelect, RuxOption, RuxInput } from '@astrouxds/react'
import PropTypes from 'prop-types';
import { Grid, Card } from '@mui/material';
//import { AstroTheme } from '../../../../../themes/AstroTheme';
import { outputStyle } from '../../../../styles';
import { useSewApp } from '../../../../../context/sewAppContext';
import { antennas, satellites } from '../../../../../constants';
import { CRUDdataTable } from '../../../../../crud/crud';
import { breakerSound, errorSound, selectSound } from '../../../../../audio';
import useSound from 'use-sound';
import './AntennaCase.css'

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
      <RuxNotification 
        open={isErrorActive} 
        status='critical' 
        closeAfter={3}
        hideClose 
        onRuxclosed={() => { setErrorActive(false) }}
        >
        Antenna is currently not operational. Try enabling it first!
      </RuxNotification>
      <Grid container pl={2} height={'100%'}>
        <Grid container item xs={12} spacing={0.5}>
          <Grid container item xs={12}>
            <Grid item pr={2} xs={7}>
              <RuxSelect 
                name='Target'
                size='small'
                label='Target'
                value={inputData.target_id}
                onRuxchange={(e) => handleInputChange({ param: 'target_id', val: e.target.value })}>
                  {satellites.map((x, index) => {
                  return (
                    <RuxOption value={x.id} label={x.name} key={index}>
                      {x.name}
                    </RuxOption>
                  );
                })}
                </RuxSelect>
            </Grid>
            <Grid item xs={true}>
              <Card
                variant='outlined'
                sx={outputStyle}
                >
                  {satellites[sewAppCtx.antenna[antennaIdx].target_id - 1].name}
              </Card>
            </Grid>
          </Grid>
          <Grid container item xs={12}>
            <Grid item pr={2} xs={7}>
            <RuxSelect 
                name='band'
                size='small'
                label='Band'
                value={inputData.band}
                onRuxchange={(e) => handleInputChange({ param: 'band', val: e.target.value })}>
                {antennas.map((x, index) => {
                  return (
                    <RuxOption value={index} label={x.band} key={index}>
                      {x.band}
                    </RuxOption>
                  );
                })}
                </RuxSelect>
            </Grid>
            <Grid item xs={true}>
              <Card
                variant='outlined'
                sx={outputStyle}
                >
                {antennas[sewAppCtx.antenna[antennaIdx]?.band]?.band}
              </Card>
            </Grid>
          </Grid>
          <Grid container item xs={12}>
            <Grid item pr={2} xs={7}>
              <RuxInput
                name='offset'
                size='small'
                label='Offset'
                type='text'
                value={inputData.offset}
                onRuxchange={(e) => {
                  handleInputChange({ param: 'offset', val: e.target.value });
                }}></RuxInput>
            </Grid>
            <Grid item xs={true}>
              <Card
                variant='outlined'
                sx={outputStyle}
                >
                  {sewAppCtx.antenna[antennaIdx].offset + ' MHz'}
              </Card>
            </Grid>
          </Grid>
          <Grid container item xs={12}>
            <Grid item xs={true}>
              <RuxSwitch
                label='Auto-Track'
                checked={inputData.track}
                onRuxchange={() => {
                  if (!inputData.operational) {
                    setErrorActive(true);
                    playErrorSound();
                    // if (errorResetTimeout) clearTimeout(errorResetTimeout);
                    // errorResetTimeout = setTimeout(() => {
                    //   setErrorActive(false);
                    // }, popupTimeoutTime);
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
                }}></RuxSwitch>
            </Grid>
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
          <RuxTooltip message='Commit Changes'>
            <RuxButton style={{ marginRight: '8px' }} onClick={(e) => handleApply(e)}>
              Apply
            </RuxButton>
          </RuxTooltip>
          <RuxTooltip message={!sewAppCtx.antenna[antennaIdx]?.operational ? 'Enable Antenna' : 'Disable Antenna'}>
            <RuxPushButton label={sewAppCtx.antenna[antennaIdx]?.operational ? 'Power' : 'Power'} onRuxchange={(e) => handleEnable(e)} />
          </RuxTooltip>
        </Grid>
      </Grid>
    </>
  );
};
AntennaInput.propTypes = {
  unit: PropTypes.number.isRequired,
};
