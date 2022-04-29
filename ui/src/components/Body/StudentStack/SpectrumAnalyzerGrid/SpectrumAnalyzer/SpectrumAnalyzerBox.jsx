/* eslint-disable react/prop-types */

import { Box, Button, Grid, Typography } from '@mui/material';
import { SpectrumAnalyzer } from './SpectrumAnalyzer.js';
import React, { useLayoutEffect, useState } from 'react';
import { AstroTheme } from '../../../../../themes/AstroTheme.js';

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

const configButtonStyle = {
  backgroundColor: AstroTheme.palette.warning.main,
  boxShadow: '0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19)',
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

  useLayoutEffect(() => {
    console.log('resizeStart');
  }, []);

  useLayoutEffect(() => {
    const canvasDom = document.getElementById(props.canvasId);
    canvasDom.width = canvasDom.parentElement.offsetWidth - 6;
    canvasDom.height = canvasDom.parentElement.offsetWidth - 6;

    const defaultSpecAConfig = {
      minDecibels: -120,
      maxDecibels: -20,
      refreshRate: 5, // per second
      noiseFloor: -115,
      isShowSignals: false,
    };

    const specA = new SpectrumAnalyzer(canvasDom, defaultSpecAConfig);
    setSpecA(specA);

    setSpecAConfig({
      bandwidth: (specA.maxFreq - specA.minFreq) / 1e6,
      centerFreq: (specA.maxFreq - (specA.maxFreq - specA.minFreq) / 2) / 1e6,
      minDecibels: specA.minDecibels,
      maxDecibels: specA.maxDecibels,
    });

    switch (props.canvasId) {
      case 'specA1':
        specA.signals.push({ freq: 425e6, amp: -108, bw: 3e6 });
        specA.signals.push({ freq: 435e6, amp: -80, bw: 10e6 });
        specA.signals.push({ freq: 445e6, amp: -60, bw: 5e6 });
        break;
      case 'specA2':
        specA.signals.push({ freq: 448e6, amp: -60, bw: 1e6 });
        specA.signals.push({ freq: 422e6, amp: -60, bw: 0.5e6 });
        specA.signals.push({ freq: 423e6, amp: -60, bw: 1e6 });
        break;
      case 'specA3':
        specA.signals.push({ freq: 439e6, amp: -60, bw: 1e6 });
        specA.signals.push({ freq: 449e6, amp: -70, bw: 1e6 });
        specA.signals.push({ freq: 429e6, amp: -60, bw: 1e6 });
        break;
      case 'specA4':
        specA.signals.push({ freq: 435e6, amp: -70, bw: 1e6 });
        specA.signals.push({ freq: 437e6, amp: -70, bw: 1e6 });
        specA.signals.push({ freq: 438e6, amp: -70, bw: 1e6 });
        break;
    }
    specA.start();
  }, []);

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
          sx={{ border: '3px solid #000', borderRadius: '5px', boxShadow: '0px 0px 10px rgba(0,0,0,0.2)' }}
          xs={9}>
          <canvas id={props.canvasId} />
        </Grid>
        <Grid item xs={12}>
          <Typography>CF: {specAConfig.centerFreq} MHz</Typography>
        </Grid>
        <Grid item xs={4}></Grid>
        <Grid item xs={4}>
          <Button sx={configButtonStyle} onClick={() => props.handleConfigClick(specA)}>
            Config
          </Button>
        </Grid>
        <Grid item xs={4}></Grid>
      </Grid>
    </Box>
  );
};

export default SpectrumAnalyzerBox;
