import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Grid, Tooltip, Typography } from '@mui/material';
import { AstroTheme } from '../../../../../../themes/AstroTheme';
import { useSewApp } from '../../../../../../context/sewAppContext';
import { CRUDdataTable } from '../../../../../../crud';
import { useSound } from 'use-sound';
import { selectSound } from '../../../../../../audio';
import { sxValues, sxValuesGrid } from '../../../../../styles';

export const RxModemInput = ({ currentRow }) => {
  const [playSelectSound] = useSound(selectSound);
  const sewAppCtx = useSewApp();

  const [inputData, setInputData] = useState(sewAppCtx.rx[currentRow]);
  useEffect(() => {
    setInputData(sewAppCtx.rx[currentRow]);
  }, [currentRow]);

  const sxInputApply = {
    backgroundColor: AstroTheme.palette.tertiary.light3,
    boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.75)',
    color: 'black',
    cursor: 'pointer',
    marginTop: '20px',
  };

  const handleInputChange = ({ param, val }) => {
    let tmpData = { ...inputData };
    tmpData[param] = val;
    setInputData(tmpData);
  };

  const handleApply = () => {
    playSelectSound();
    let tmpData = [...sewAppCtx.rx];
    tmpData[currentRow] = { ...inputData };
    sewAppCtx.updateRx(tmpData);
    CRUDdataTable({ method: 'PATCH', path: 'receiver', data: tmpData[currentRow] });
  };

  return (
    <Grid container mt={1} pb={2} height={'100%'}>
      <Grid container item xs={12} spacing={0.5}>
        <Grid container item xs={12} alignItems='center' justify='center'>
          <Grid item xs={3} textAlign='right'>
            <Typography>Antenna</Typography>
          </Grid>
          <Grid item xs={4.5} pr={2}>
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
          <Grid item xs={0.5}></Grid>
          <Grid item xs={true} sx={sxValuesGrid}>
            <Typography sx={sxValues}>{sewAppCtx.rx[currentRow].antenna_id}</Typography>
          </Grid>
        </Grid>
        <Grid container item xs={12} alignItems='center' justify='center'>
          <Grid item xs={3} textAlign='right'>
            <Typography>Freq</Typography>
          </Grid>
          <Grid item xs={4.5} pr={2}>
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
          <Grid item xs={0.5}></Grid>
          <Grid item xs={true} sx={sxValuesGrid}>
            <Typography sx={sxValues}>{sewAppCtx.rx[currentRow].frequency + ' MHz'}</Typography>
          </Grid>
        </Grid>
        <Grid container item xs={12} alignItems='center' justify='center'>
          <Grid item xs={3} textAlign='right'>
            <Typography>BW</Typography>
          </Grid>
          <Grid item xs={4.5} pr={2}>
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
          <Grid item xs={0.5}></Grid>
          <Grid item xs={true} sx={sxValuesGrid}>
            <Typography sx={sxValues}>{sewAppCtx.rx[currentRow].bandwidth + ' MHz'}</Typography>
          </Grid>
        </Grid>
        <Grid container item xs={12} alignItems='center' justify='center'>
          <Grid item xs={3} textAlign='right'>
            <Typography>Mod</Typography>
          </Grid>
          <Grid item xs={4.5} pr={2}>
            <select
              name='modulation'
              value={inputData.modulation}
              onChange={(e) => handleInputChange({ param: 'modulation', val: e.target.value || 0 })}>
              <option value='BPSK'>BPSK</option>
              <option value='QPSK'>QPSK</option>
              <option value='8QAM'>8QAM</option>
              <option value='16QAM'>16QAM</option>
            </select>
          </Grid>
          <Grid item xs={0.5}></Grid>
          <Grid item xs={true} sx={sxValuesGrid}>
            <Typography sx={sxValues}>{sewAppCtx.rx[currentRow].modulation}</Typography>
          </Grid>
        </Grid>
        <Grid container item xs={12} alignItems='center' justify='center'>
          <Grid item xs={3} textAlign='right'>
            <Typography>FEC</Typography>
          </Grid>
          <Grid item xs={4.5} pr={2}>
            <select
              name='fec'
              value={inputData.fec}
              onChange={(e) => handleInputChange({ param: 'fec', val: e.target.value || 0 })}>
              <option value='1/2'>1/2</option>
              <option value='2/3'>2/3</option>
              <option value='3/4'>3/4</option>
              <option value='5/6'>5/6</option>
              <option value='7/8'>7/8</option>
            </select>
          </Grid>
          <Grid item xs={0.5}></Grid>
          <Grid item xs={true} sx={sxValuesGrid}>
            <Typography sx={sxValues}>{sewAppCtx.rx[currentRow].fec}</Typography>
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
        </Grid>
      </Grid>
    </Grid>
  );
};
RxModemInput.propTypes = {
  currentRow: PropTypes.number,
};
