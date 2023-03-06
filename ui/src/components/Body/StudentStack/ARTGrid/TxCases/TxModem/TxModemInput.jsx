import React, { useState } from 'react';
import { RuxButton, RuxPushButton, RuxTooltip, RuxSelect, RuxOption, RuxInput } from '@astrouxds/react'
import { Box, Grid, Typography, Card } from '@mui/material';
//import { AstroTheme } from '../../../../../../themes/AstroTheme';
import { useSewApp } from '../../../../../../context/sewAppContext';
import { CRUDdataTable } from '../../../../../../crud';
import { sxModalError, outputStyle } from '../../../../../styles';
import { breakerSound, errorSound, selectSound } from '../../../../../../audio';
import { useSound } from 'use-sound';
import { PropTypes } from 'prop-types';
import { useEffect } from 'react';
import { LinearProgressWithLabel } from './LinearProgressWithLabel';

const popupTimeoutTime = 3000;
let errorResetTimeout;

export const TxModemInput = ({ unitData, activeModem, currentRow, }) => {
  const [playSelectSound] = useSound(selectSound);
  const [playBreakerSound] = useSound(breakerSound);
  const [playErrorSound] = useSound(errorSound);
  const sewAppCtx = useSewApp();
  const powerBudget = 23886; // Decided by SEW team
  const [isErrorActive, setErrorActive] = useState(false);
  const [inputData, setInputData] = useState(sewAppCtx.tx[currentRow]);
  const [modemPower, setModemPower] = useState(inputData.bandwidth * Math.pow(10, (120 + inputData.power) / 10));

  useEffect(() => {
    setInputData(sewAppCtx.tx[currentRow]);
    setModemPower(inputData.bandwidth * Math.pow(10, (120 + inputData.power) / 10));
  }, [currentRow]);

  const handleInputChange = ({ param, val }) => {
    if (param === 'power') {
      // if contains any symbols except - and number then return
      if (val.match(/[^0-9-]/g)) return;
      if (!isNaN(parseInt(val))) {
        val = parseInt(val);
      }
    }
    let tmpData = { ...sewAppCtx.tx[currentRow] };
    tmpData[param] = val;
    setInputData(tmpData);
  };

  const validatePowerConsumption = (_modemPower = modemPower) => Math.round((100 * _modemPower) / powerBudget) <= 100;

  const handleApply = () => {
    playSelectSound();
    let tmpData = [...sewAppCtx.tx];
    tmpData[currentRow] = { ...inputData };

    if (
      validatePowerConsumption(inputData.bandwidth * Math.pow(10, (120 + inputData.power) / 10)) ||
      !tmpData[currentRow].transmitting
    ) {
      sewAppCtx.updateTx(tmpData);
      setModemPower(inputData.bandwidth * Math.pow(10, (120 + inputData.power) / 10));
      CRUDdataTable({ method: 'PATCH', path: 'transmitter', data: tmpData[currentRow] });
    } else {
      setErrorActive(true);
      playErrorSound();
      if (errorResetTimeout) clearTimeout(errorResetTimeout);
      errorResetTimeout = setTimeout(() => {
        setErrorActive(false);
      }, popupTimeoutTime);
    }
  };

  const handleTransmit = () => {
    playBreakerSound();
    let tmpData = [...sewAppCtx.tx];

    if (validatePowerConsumption()) {
      tmpData[currentRow].transmitting = !tmpData[currentRow].transmitting;
      sewAppCtx.updateTx(tmpData);
      // console.log('CRUD Tx: ', tmpData[currentRow]);
      CRUDdataTable({ method: 'PATCH', path: 'transmitter', data: tmpData[currentRow] });
    } else {
      setErrorActive(true);
      playErrorSound();
      if (errorResetTimeout) clearTimeout(errorResetTimeout);
      errorResetTimeout = setTimeout(() => {
        setErrorActive(false);
      }, popupTimeoutTime);
    }
  };

  return (
    <>
      {isErrorActive ? (
        <Box sx={sxModalError}>
          <Typography>Power consumption exceeds the budget.</Typography>
        </Box>
      ) : null}
      <Grid container pb={2} height={'100%'}>
        <Grid container item xs={12} spacing={0.5}>
          <Grid container item xs={12} pt={0} alignItems='center' justify='center'>
            <Grid item xs={8} pl={2} pr={2}>
              <RuxSelect
                name='Antenna'
                label='Antenna'
                size='small'
                value={inputData.antenna_id}
                onRuxchange={(e) =>
                  handleInputChange({
                    param: 'antenna_id',
                    val: parseInt(e.target.value) || 0,
                  })
                }
              >
                <RuxOption value={1} label={1}>1</RuxOption>
                <RuxOption value={2} label={2}>2</RuxOption>
              </RuxSelect>
            </Grid>
            <Grid item xs={true}>
              <Card
                variant='outlined'
                sx={outputStyle}
                >
                  {sewAppCtx.tx[currentRow].antenna_id}
              </Card>
            </Grid>
          </Grid>
          <Grid container item xs={12} alignItems='center' justify='center'>
            <Grid item xs={8} pl={2} pr={2}>
              <RuxInput
                name='frequency'
                type='text'
                label='Freq'
                size='small'
                value={inputData.frequency}
                onRuxchange={(e) =>
                  handleInputChange({
                    param: 'frequency',
                    val: parseInt(e.target.value) || 0,
                  })
                }
              >

              </RuxInput>
            </Grid>
            <Grid item xs={true}>
              <Card
                variant='outlined'
                sx={outputStyle}
                >
                  {sewAppCtx.tx[currentRow].frequency + ' MHz'}
              </Card>
            </Grid>
          </Grid>
          <Grid container item xs={12} alignItems='center' justify='center'>
            <Grid item xs={8} pl={2} pr={2}>
              <RuxInput
                name='bandwidth'
                type='text'
                size='small'
                label='BW'
                value={inputData.bandwidth}
                onRuxchange={(e) =>
                  handleInputChange({
                    param: 'bandwidth',
                    val: parseInt(e.target.value) || 0,
                  })
                }
              >
              </RuxInput>
            </Grid>
            <Grid item xs={true}>
              <Card
                variant='outlined'
                sx={outputStyle}
                >
                  {sewAppCtx.tx[currentRow].bandwidth + ' MHz'}
              </Card>
            </Grid>
          </Grid>
          <Grid container item xs={12} alignItems='center' justify='center'>
            <Grid item xs={8} pl={2} pr={2}>
              <RuxInput
                name='power'
                type='string'
                size='small'
                label='Power'
                value={inputData.power}
                onRuxchange={(e) => handleInputChange({ param: 'power', val: e.target.value })}
              >
              </RuxInput>
            </Grid>
            <Grid item xs={true}>
              <Card
                variant='outlined'
                sx={outputStyle}
                >
                  {`${sewAppCtx.tx[currentRow].power} dBm`}
              </Card>
            </Grid>
          </Grid>
          <Grid container item xs={12} alignItems='center' justify='center'>
            <Grid item xs={3} textAlign='right'>
              <Typography>Power %</Typography>
            </Grid>
            <Grid item xs={true}>
              <LinearProgressWithLabel value={Math.round((100 * modemPower) / powerBudget)} />
            </Grid>
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
          <RuxTooltip
            message={
              !unitData.filter((x) => x.modem_number == activeModem)[0].transmitting
                ? 'Enable Transmitter'
                : 'Disable Transmitter'
            }>
            <RuxPushButton label='TX' onRuxchange={(e) => handleTransmit(e)} checked={
              unitData.filter((x) => x.modem_number == activeModem)[0].transmitting ? true : false}/>
          </RuxTooltip>
        </Grid>
      </Grid>
    </>
  );
};

TxModemInput.propTypes = {
  unitData: PropTypes.array.isRequired,
  activeModem: PropTypes.number.isRequired,
  currentRow: PropTypes.number.isRequired,
};
