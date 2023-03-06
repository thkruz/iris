import React, { useState, useEffect } from 'react';
import { RuxButton, RuxTooltip, RuxSelect, RuxOption, RuxInput } from '@astrouxds/react'
import PropTypes from 'prop-types';
import { Grid, Card } from '@mui/material';
import { AstroTheme } from '../../../../../../themes/AstroTheme';
import { useSewApp } from '../../../../../../context/sewAppContext';
import { CRUDdataTable } from '../../../../../../crud';
import { outputStyle } from '../../../../../styles';
import { useSound } from 'use-sound';
import { selectSound } from '../../../../../../audio';

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
    <Grid container pb={2} height={'100%'}>
      <Grid container item ml={2} xs={12} spacing={0.5}>
        <Grid container item xs={12} alignItems='center' justify='center'>
          <Grid item xs={7} pr={2}>
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
            <Card sx={outputStyle}>
              {sewAppCtx.rx[currentRow].antenna_id}
            </Card>
          </Grid>
        </Grid>
        <Grid container item xs={12} alignItems='center' justify='center'>
          <Grid item xs={7} pr={2}>
            <RuxInput
              name='frequency'
              type='text'
              size='small'
              label='Freq'
              value={inputData.frequency}
              onRuxchange={(e) =>
                handleInputChange({
                  param: 'frequency',
                  val: parseInt(e.target.value) || 0,
                })
              }></RuxInput>
          </Grid>
          <Grid item xs={true}>
          <Card sx={outputStyle}>
            {sewAppCtx.rx[currentRow].frequency + ' MHz'}
          </Card>
          </Grid>
        </Grid>
        <Grid container item xs={12} alignItems='center' justify='center'>
          <Grid item xs={7} pr={2}>
            <RuxInput
              name='bandwidth'
              type='text'
              label='BW'
              size='small'
              value={inputData.bandwidth}
              onRuxchange={(e) =>
                handleInputChange({
                  param: 'bandwidth',
                  val: parseInt(e.target.value) || 0,
                })
              }></RuxInput>
          </Grid>
          <Grid item xs={true}>
            <Card sx={outputStyle}>
              {sewAppCtx.rx[currentRow].bandwidth + ' MHz'}
            </Card>
          </Grid>
        </Grid>
        <Grid container item xs={12} alignItems='center' justify='center'>
          <Grid item xs={7} pr={2}>
            <RuxSelect
              name='modulation'
              value={inputData.modulation}
              label='Mod'
              size='small'
              onRuxchange={(e) => handleInputChange({ param: 'modulation', val: e.target.value || 0 })}>
              <RuxOption value='BPSK' label='BPSK'>BPSK</RuxOption>
              <RuxOption value='QPSK' label='QPSK'>QPSK</RuxOption>
              <RuxOption value='8QAM' label='8QAM'>8QAM</RuxOption>
              <RuxOption value='16QAM' label='16QAM'>16QAM</RuxOption>
            </RuxSelect>
          </Grid>
          <Grid item xs={true}>
            <Card sx={outputStyle}>
              {sewAppCtx.rx[currentRow].modulation}
            </Card>
          </Grid>
        </Grid>
        <Grid container item xs={12} alignItems='center' justify='center'>
          <Grid item xs={7} pr={2}>
            <RuxSelect
              name='fec'
              label='FEC'
              size='small'
              value={inputData.fec}
              onRuxchange={(e) => handleInputChange({ param: 'fec', val: e.target.value || 0 })}>
              <RuxOption value='1/2' label='1/2'>1/2</RuxOption>
              <RuxOption value='2/3' label='2/3'>2/3</RuxOption>
              <RuxOption value='3/4' label='3/4'>3/4</RuxOption>
              <RuxOption value='5/6' label='5/6'>5/6</RuxOption>
              <RuxOption value='7/8' label='7/8'>7/8</RuxOption>
            </RuxSelect>
          </Grid>
          <Grid item xs={true}>
            <Card sx={outputStyle}>
              {sewAppCtx.rx[currentRow].fec}
            </Card>
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
            <RuxButton sx={sxInputApply} onClick={(e) => handleApply(e)}>
              Apply
            </RuxButton>
          </RuxTooltip>
        </Grid>
      </Grid>
    </Grid>
  );
};
RxModemInput.propTypes = {
  currentRow: PropTypes.number,
};
