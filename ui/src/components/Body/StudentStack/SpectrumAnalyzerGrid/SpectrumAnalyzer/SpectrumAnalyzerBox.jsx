import { Box, Button, Grid, Typography } from '@mui/material';
import { SpectrumAnalyzer } from '../../../../';
import React, { useLayoutEffect, useState } from 'react';
import { AstroTheme } from '../../../../../themes/AstroTheme.js';
import { useEffect } from 'react';
import { satellites } from '../../../../../constants';
import { useAntenna } from './../../../../../context';
import PropTypes from 'prop-types';
import config from './../../../../../config';

const ApiUrl = config[process.env.REACT_APP_NODE_ENV || 'development'].apiUrl;

const SpectrumAnalyzerBoxStyle = {
  textAlign: 'center',
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  borderRadius: '10px',
  boxShadow: '0px 0px 5px rgba(0,0,0,0.5)',
  backgroundColor: AstroTheme.palette.tertiary.light2,
  border: '1px solid' + AstroTheme.palette.tertiary.light,
  overflow: 'hidden',
  position: 'relative',
  zIndex: '1',
};

const sxInputRow = {
  fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
  textAlign: 'left',
  margin: '8px',
  height: '30px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '1em',
};

const configButtonStyle = {
  backgroundColor: AstroTheme.palette.warning.main,
  boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.75)',
  color: 'black',
  margin: '8px',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: AstroTheme.palette.serious.main,
  },
};

export const updateSpecAwAntennaInfo = (antenna_id, specA, antenna) => {
  specA.antennaId = antenna_id;
  let { band, hpa, target_id, lock, loopback, offset, operational } = antenna[specA.antennaId - 1];
  specA.targetId = target_id;
  console.log('updateSpecAwAntennaInfo', specA.antennaId, specA.targetId);

  specA.hpa = hpa;
  specA.loopback = loopback;
  specA.lock = lock;
  specA.operational = operational;

  band = band === 0 ? 'c' : 'ku';
  const bandOffset = window.sewApp.constants.antennas.filter(antenna => antenna.band.toLowerCase() === band)[0];
  specA.downconvertOffset = bandOffset.downconvert;
  specA.upconvertOffset = bandOffset.upconvert;
  if (!loopback) {
    // RF Settings
    specA.targetOffset = satellites.filter(target => target.id === target_id)[0].offset;
  } else {
    // IF Settings
    specA.antennaOffset = offset * 1e6;
  }
};
const canvasContainer = {
  position: 'relative',
  border: '8px solid transparent',
  borderImageSource: 'url(./bezel.png)',
  borderImageSlice: '30 fill',
  borderImageOutset: 0,
  overflow: 'hidden',
  boxShadow: '0px 0px 10px rgba(0,0,0,0.5)',
  backgroundColor: '#282a2b',
  borderRadius: '10px',
};
export const SpectrumAnalyzerBox = props => {
  const [specAConfig, setSpecAConfig] = useState({});
  const [specA, setSpecA] = useState({});
  const [isRfMode, setIsRfMode] = useState(false);
  const [isPause, setIsPause] = useState(false);
  const antenna = useAntenna();

  const updateSpecAConfig = () => {
    setSpecAConfig({
      bandwidth: (specA.maxFreq - specA.minFreq) / 1e6,
      centerFreq: (specA.maxFreq - (specA.maxFreq - specA.minFreq) / 2) / 1e6,
      minDecibels: specA.minDecibels,
      maxDecibels: specA.maxDecibels,
    });
  };

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
      whichUnit: parseInt(props.canvasId.split('A')[1]),
      minDecibels: -120,
      maxDecibels: -20,
      minFreq: 4650000000,
      maxFreq: 4750000000,
      refreshRate: 2, // per second
      noiseFloor: -115,
      isShowSignals: false,
    };

    fetch(`${ApiUrl}/data/spec_a`).then(res => {
      res.json().then(data => {
        const specA = new SpectrumAnalyzer(canvasDom, defaultSpecAConfig);

        data = data.filter(specA_DB => specA_DB.unit === specA.whichUnit && specA_DB.team_id === 1); // TODO Allow other teams!
        specA.config = {
          if: {
            freq: data[0].frequency * 1e6, // MHz to Hz
            span: data[0].span * 1e6, // MHz to Hz
          },
          rf: {
            freq: data[1].frequency * 1e6, // MHz to Hz
            span: data[1].span * 1e6, // MHz to Hz
          },
        };

        const { id_target } = antenna[1];
        specA.targetId = id_target;

        specA.changeCenterFreq(specA.isRfMode ? specA.config.rf.freq : specA.config.if.freq);
        specA.changeBandwidth(specA.isRfMode ? specA.config.rf.span : specA.config.if.span);

        setSpecA(specA);
        updateSpecAConfig();
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
      });
    });
  }, []);

  useEffect(() => {
    if (!specA.antennaId) return;
    const { id_target } = antenna[specA.antennaId - 1];
    specA.targetId = id_target;
  }, [antenna]);

  const handleRfClicked = () => {
    specA.isRfMode = !specA.isRfMode;
    specA.changeCenterFreq(specA.isRfMode ? specA.config.rf.freq : specA.config.if.freq);
    specA.changeBandwidth(specA.isRfMode ? specA.config.rf.span : specA.config.if.span);
    updateSpecAConfig();
    setSpecA(specA);
    setIsRfMode(!isRfMode);
    const _specA = window.sewApp[`specA${specA.canvas.id.split('A')[1]}`];
    _specA.isRfMode = !isRfMode;
    if (_specA.isRfMode) {
      _specA.noiseFloor -= _specA.noiseFloor * 0.05;
    } else {
      _specA.noiseFloor += _specA.noiseFloor * 0.05;
    }
    props.handleRfClick(_specA);
  };

  const handlePauseClicked = () => {
    specA.isPause = !specA.isPause;
    setSpecA(specA);
    setIsPause(!isPause);
    const _specA = window.sewApp[`specA${specA.canvas.id.split('A')[1]}`];
    _specA.isPause = !isPause;
    props.handlePauseClicked(_specA);
  };

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
        <Grid container item sx={canvasContainer} xs={9}>
          <canvas id={props.canvasId} />
        </Grid>
        <Grid item xs={12}>
          <Typography>CF: {specAConfig.centerFreq} MHz</Typography>
        </Grid>
        <Grid item xs={3}>
          <Box sx={sxInputRow}>
            <label htmlFor='Antenna'>Ant</label>
            <select
              name='Antenna'
              value={specA.id_antenna}
              onChange={e => updateSpecAwAntennaInfo(parseInt(e.target.value), specA, antenna)}>
              <option value={1}>1</option>
              <option value={2}>2</option>
            </select>
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Button sx={configButtonStyle} onClick={() => props.handleConfigClick(specA, setSpecAConfig)}>
            Config
          </Button>
        </Grid>
        <Grid item xs={3}>
          <Button
            sx={{
              ...configButtonStyle,
              ...{ backgroundColor: isRfMode ? 'red' : 'yellow', color: isRfMode ? 'white' : 'black' },
            }}
            onClick={handleRfClicked}>
            {isRfMode ? 'RF' : 'IF'}
          </Button>
        </Grid>
        <Grid item xs={3}>
          <Button
            sx={{
              ...configButtonStyle,
              ...{ backgroundColor: isPause ? 'red' : 'yellow', color: isPause ? 'white' : 'black' },
            }}
            onClick={handlePauseClicked}>
            {isPause ? 'Unpause' : 'Pause'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

SpectrumAnalyzerBox.propTypes = {
  canvasId: PropTypes.any,
  handleConfigClick: PropTypes.any,
  handleRfClick: PropTypes.any,
  handlePauseClicked: PropTypes.any,
};
