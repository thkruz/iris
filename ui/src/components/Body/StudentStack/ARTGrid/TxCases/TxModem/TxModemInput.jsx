import React, { useState } from 'react';
import { Box, Button, Grid, Tooltip, Typography } from '@mui/material';
import { AstroTheme } from '../../../../../../themes/AstroTheme';
import { useSewApp } from '../../../../../../context/sewAppContext';
import { CRUDdataTable } from '../../../../../../crud';
import { sxModalError, sxValues, sxValuesGrid } from '../../../../../styles';
import { breakerSound, errorSound, selectSound } from '../../../../../../audio';
import { useSound } from 'use-sound';
import { PropTypes } from 'prop-types';
import { useEffect } from 'react';
import { LinearProgressWithLabel } from './LinearProgressWithLabel';

const popupTimeoutTime = 3000;
let errorResetTimeout;

const sxInputApply = {
  backgroundColor: AstroTheme.palette.tertiary.light3,
  boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.75)',
  color: 'black',
  cursor: 'pointer',
};

export const TxModemInput = ({ unitData, activeModem, currentRow }) => {
  const [playSelectSound] = useSound(selectSound);
  const [playBreakerSound] = useSound(breakerSound);
  const [playErrorSound] = useSound(errorSound);
  const sewAppCtx = useSewApp();
  const powerBudget = 23886; // Decided by SEW team
  const [isErrorActive, setErrorActive] = useState(false);
  const [inputData, setInputData] = useState(sewAppCtx.tx[currentRow]);
  const [modemPower, setModemPower] = useState(inputData.bandwidth * Math.pow(10, (120 + inputData.power) / 10));

  const sxTransmit = {
    cursor: 'pointer',
    marginLeft: '10px',
    boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.5)',
    border: '1px solid red',
    backgroundColor: unitData.filter((x) => x.modem_number == activeModem)[0].transmitting
      ? 'red'
      : AstroTheme.palette.tertiary.light3,
    color: unitData.filter((x) => x.modem_number == activeModem)[0].transmitting ? 'white' : 'black',
    '&:hover': {
      backgroundColor: unitData.filter((x) => x.modem_number == activeModem)[0].transmitting
        ? AstroTheme.palette.error.main
        : AstroTheme.palette.critical.main,
      color: unitData.filter((x) => x.modem_number == activeModem)[0].transmitting ? 'black' : 'white',
    },
  };

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
      <Grid container mt={1} pb={2} height={'100%'}>
        <Grid container item xs={12} spacing={0.5}>
          <Grid container item xs={12} alignItems='center' justify='center'>
            <Grid item xs={3} textAlign='right'>
              <Typography>Antenna</Typography>
            </Grid>
            <Grid item xs={4} pr={2}>
              <select
                name='Antenna'
                value={inputData.antenna_id}
                onChange={(e) =>
                  handleInputChange({
                    param: 'antenna_id',
                    val: parseInt(e.target.value) || 0,
                  })
                }>
                <option value={1}>1</option>
                <option value={2}>2</option>
              </select>
            </Grid>
            <Grid item xs={1}></Grid>
            <Grid item xs={true} sx={sxValuesGrid}>
              <Typography sx={sxValues}>{sewAppCtx.tx[currentRow].antenna_id}</Typography>
            </Grid>
          </Grid>
          <Grid container item xs={12} alignItems='center' justify='center'>
            <Grid item xs={3} textAlign='right'>
              <Typography>Freq</Typography>
            </Grid>
            <Grid item xs={4} pr={2}>
              <input
                name='frequency'
                type='text'
                value={inputData.frequency}
                onChange={(e) =>
                  handleInputChange({
                    param: 'frequency',
                    val: parseInt(e.target.value) || 0,
                  })
                }></input>
            </Grid>
            <Grid item xs={1}></Grid>
            <Grid item xs={true} sx={sxValuesGrid}>
              <Typography sx={sxValues}>{sewAppCtx.tx[currentRow].frequency + ' MHz'}</Typography>
            </Grid>
          </Grid>
          <Grid container item xs={12} alignItems='center' justify='center'>
            <Grid item xs={3} textAlign='right'>
              <Typography>BW</Typography>
            </Grid>
            <Grid item xs={4} pr={2}>
              <input
                name='bandwidth'
                type='text'
                value={inputData.bandwidth}
                onChange={(e) =>
                  handleInputChange({
                    param: 'bandwidth',
                    val: parseInt(e.target.value) || 0,
                  })
                }></input>
            </Grid>
            <Grid item xs={1}></Grid>
            <Grid item xs={true} sx={sxValuesGrid}>
              <Typography sx={sxValues}>{sewAppCtx.tx[currentRow].bandwidth + ' MHz'}</Typography>
            </Grid>
          </Grid>
          <Grid container item xs={12} alignItems='center' justify='center'>
            <Grid item xs={3} textAlign='right'>
              <Typography>Power</Typography>
            </Grid>
            <Grid item xs={4} pr={2}>
              <input
                name='power'
                type='string'
                value={inputData.power}
                onChange={(e) => handleInputChange({ param: 'power', val: e.target.value })}></input>
            </Grid>
            <Grid item xs={1}></Grid>
            <Grid item xs={true} sx={sxValuesGrid}>
              <Typography sx={sxValues}>{`${sewAppCtx.tx[currentRow].power} dBm`}</Typography>
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
          <Tooltip title='Commit Changes'>
            <Button sx={sxInputApply} onClick={(e) => handleApply(e)}>
              Apply
            </Button>
          </Tooltip>
          <Tooltip
            title={
              !unitData.filter((x) => x.modem_number == activeModem)[0].transmitting
                ? 'Enable Transmitter'
                : 'Disable Transmitter'
            }>
            <Button sx={sxTransmit} onClick={(e) => handleTransmit(e)}>
              TX
            </Button>
          </Tooltip>
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
