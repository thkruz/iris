/* eslint-disable react/prop-types */

import { Box, Button, Grid, Typography } from '@mui/material';
import { SpectrumAnalyzer } from './SpectrumAnalyzer.js';
import React, { useLayoutEffect, useState } from 'react';
import { AstroTheme } from '../../../../../themes/AstroTheme.js';
import { useEffect } from 'react';
import { useAntenna } from './../../../../../context/antennaContext';

// MUI Stack: https://mui.com/material-ui/react-stack/

const SpectrumAnalyzerBoxStyle = {
  backgroundColor: '#005a8f',
  textAlign: 'center',
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  borderRadius: '10px',
  boxShadow: '0px 0px 10px rgba(0,0,0,0.5)',
  border: '1px solid #005a8f',
  overflow: 'hidden',
  position: 'relative',
  zIndex: '1',
};

const sxInputRow = {
  fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
  display: 'grid',
  gridTemplateColumns: '80px 80px 80px',
  textAlign: 'left',
  margin: '8px',
  height: '30px',
};

const configButtonStyle = {
  backgroundColor: AstroTheme.palette.warning.main,
  boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.75)',
  color: 'black',
  margin: '8px',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: AstroTheme.palette.warning.Lighten2,
  },
};

const SpectrumAnalyzerBox = props => {
  const [specAConfig, setSpecAConfig] = useState({});
  const [specA, setSpecA] = useState({});
  const antenna = useAntenna();

  useEffect(() => {
    setSpecAConfig({
      bandwidth: (specA.maxFreq - specA.minFreq) / 1e6,
      centerFreq: (specA.maxFreq - (specA.maxFreq - specA.minFreq) / 2) / 1e6,
      minDecibels: specA.minDecibels,
      maxDecibels: specA.maxDecibels,
    });
  }, [specA.bandwidth, specA.centerFreq]);

  useLayoutEffect(() => {
    const canvasDom = document.getElementById(props.canvasId);
    canvasDom.width = canvasDom.parentElement.offsetWidth - 6;
    canvasDom.height = canvasDom.parentElement.offsetWidth - 6;

    const defaultSpecAConfig = {
      minDecibels: -120,
      maxDecibels: -20,
      minFreq: 4650000000,
      maxFreq: 4750000000,
      refreshRate: 5, // per second
      noiseFloor: -115,
      isShowSignals: false,
    };

    const specA = new SpectrumAnalyzer(canvasDom, defaultSpecAConfig);

    const { id_target } = antenna[1];
    specA.targetId = id_target;

    setSpecA(specA);

    setSpecAConfig({
      bandwidth: (specA.maxFreq - specA.minFreq) / 1e6,
      centerFreq: (specA.maxFreq - (specA.maxFreq - specA.minFreq) / 2) / 1e6,
      minDecibels: specA.minDecibels,
      maxDecibels: specA.maxDecibels,
    });

    switch (props.canvasId) {
      case 'specA1':
        window.sewApp.specA1 = specA;
        break;
      case 'specA2':
        window.sewApp.specA2 = specA;
        break;
      case 'specA3':
        window.sewApp.specA3 = specA;
        break;
      case 'specA4':
        window.sewApp.specA4 = specA;
        break;
    }
    specA.start();
  }, []);

  const handleAntennaChange = e => {
    const antenna_id = parseInt(e.target.value);
    specA.antennaId = antenna_id;
    const { id_target } = antenna[specA.antennaId - 1];
    specA.targetId = id_target;
    console.log(antenna[antenna_id - 1]);
  };

  useEffect(() => {
    if (!specA.antennaId) return;
    const { id_target } = antenna[specA.antennaId - 1];
    specA.targetId = id_target;
  }, [antenna]);

  // setSpectrumAnalyzer(specA);
  return (
    <Box sx={SpectrumAnalyzerBoxStyle}>
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <Typography>Span: {specAConfig.bandwidth} MHz</Typography>
        </Grid>
        <Grid container item sx={{ display: 'flex', alignContent: 'space-between' }} xs={2}>
          <Grid item xs={12}>
            <Typography>{specAConfig.maxDecibels} (dB)</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography>{specAConfig.minDecibels} (dB)</Typography>
          </Grid>
        </Grid>
        <Grid
          container
          item
          sx={{ border: '3px solid #000', borderRadius: '5px', boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.75)' }}
          xs={9}>
          <canvas id={props.canvasId} />
        </Grid>
        <Grid item xs={12}>
          <Typography>CF: {specAConfig.centerFreq} MHz</Typography>
        </Grid>
        <Grid item xs={4}>
          <Box sx={sxInputRow}>
            <label htmlFor='Antenna'>Antenna</label>
            <select name='Antenna' value={specA.id_antenna} onChange={handleAntennaChange}>
              <option value={1}>1</option>
              <option value={2}>2</option>
            </select>
          </Box>
        </Grid>
        <Grid item xs={4}>
          <Button sx={configButtonStyle} onClick={() => props.handleConfigClick(specA, setSpecAConfig)}>
            Config
          </Button>
        </Grid>
        <Grid item xs={4}></Grid>
      </Grid>
    </Box>
  );
};

export default SpectrumAnalyzerBox;
