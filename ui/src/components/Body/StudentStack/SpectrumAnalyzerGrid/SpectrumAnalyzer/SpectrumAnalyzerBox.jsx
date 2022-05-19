import { Box, Button, Grid, Typography } from '@mui/material';
import { SpectrumAnalyzer } from '../../../../';
import React, { useLayoutEffect, useState } from 'react';
import { AstroTheme } from '../../../../../themes/AstroTheme.js';
import { useEffect } from 'react';
import { satellites } from '../../../../../constants';
import { useAntenna, useUpdateSewApp } from './../../../../../context';
import PropTypes from 'prop-types';
import config from './../../../../../config';
import { useSewApp } from './../../../../../context/sewAppContext';

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
  const [isRfMode, setIsRfMode] = useState(false);
  const [isPause, setIsPause] = useState(false);
  const antenna = useAntenna();
  const updateSewAppContext = useUpdateSewApp();
  const sewApp = useSewApp();
  const whichSpecA = props.canvasId.split('A')[1];

  useEffect(() => {
    window.sewApp.socket.on('updateSpecA', data => {
      // We need to reference the global variable here
      // NOT the context object
      const specA = window.sewApp[`specA${whichSpecA}`];
      console.log('updateSpecA', data);
      if (specA.whichUnit === data.unit) {
        // TODO: Account for team
        specA.isRfMode = data.number === 2 ? true : false; // If we changed an RF Mode row of data we must be in RF Mode now
        if (specA.isRfMode) {
          specA.config.rf.freq = data.frequency * 1e6;
          specA.config.rf.span = data.span * 1e6;
        } else {
          specA.config.if.freq = data.frequency * 1e6;
          specA.config.if.span = data.span * 1e6;
        }
        specA.isDrawHold = data.hold;
        specA.antenna_id = data.antenna_id;
        const { target_id } = antenna[specA.antenna_id - 1];
        specA.target_id = target_id;

        specA.changeCenterFreq(specA.isRfMode ? specA.config.rf.freq : specA.config.if.freq);
        specA.changeBandwidth(specA.isRfMode ? specA.config.rf.span : specA.config.if.span);

        window.sewApp[`specA${whichSpecA}`] = specA;
        updateSewAppContext();
      }
    });
  }, []);

  useLayoutEffect(() => {
    const canvasDom = document.getElementById(props.canvasId);
    canvasDom.width = canvasDom.parentElement.offsetWidth - 6;
    canvasDom.height = canvasDom.parentElement.offsetWidth - 6;
    const defaultSpecAConfig = {
      whichUnit: parseInt(props.canvasId.split('A')[1]),
      minDecibels: -120,
      maxDecibels: -80,
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
        const ifData = data.filter(specA_DB => !specA_DB.rf)[0];
        const rfData = data.filter(specA_DB => specA_DB.rf)[0];
        specA.config = {
          if: {
            id: ifData.id,
            freq: ifData.frequency * 1e6, // MHz to Hz
            span: ifData.span * 1e6, // MHz to Hz
          },
          rf: {
            id: rfData.id,
            freq: rfData.frequency * 1e6, // MHz to Hz
            span: rfData.span * 1e6, // MHz to Hz
          },
        };

        const { id_target } = antenna[1];
        specA.target_id = id_target;

        specA.changeCenterFreq(specA.isRfMode ? specA.config.rf.freq : specA.config.if.freq);
        specA.changeBandwidth(specA.isRfMode ? specA.config.rf.span : specA.config.if.span);

        specA.antenna_id = data[0].antenna_id;
        const { target_id } = antenna[specA.antenna_id - 1];
        specA.target_id = target_id;

        loadSignals(specA);
        specA.start();

        window.sewApp[`specA${whichSpecA}`] = specA;
        updateSewAppContext();
      });
    });
  }, []);

  const loadSignals = specA => {
    if (window.sewApp.environment.signals.length > 0) {
      window.sewApp.environment.signals.forEach(signal => {
        specA.signals.push({
          rf: true,
          freq: signal.frequency * 1e6,
          amp: signal.power,
          bw: signal.bandwidth * 1e6,
          target_id: signal.target_id,
        });
      });
      window.sewApp[`specA${whichSpecA}`] = specA;
      updateSewAppContext();
    } else {
      setTimeout(() => {
        loadSignals(specA);
      }, 1000);
    }
  };

  useEffect(() => {
    const specA = sewApp[`specA${whichSpecA}`];
    if (!specA || !specA.antenna_id) return;
    const { target_id } = antenna[specA.antenna_id - 1];
    specA.target_id = target_id;
    updateSewAppContext();
  }, [antenna, sewApp[`specA${whichSpecA}`]]);

  const handleRfClicked = () => {
    const specA = sewApp[`specA${whichSpecA}`];
    specA.isRfMode = !specA.isRfMode;
    specA.changeCenterFreq(specA.isRfMode ? specA.config.rf.freq : specA.config.if.freq);
    specA.changeBandwidth(specA.isRfMode ? specA.config.rf.span : specA.config.if.span);
    setIsRfMode(!isRfMode);
    const _specA = window.sewApp[`specA${specA.canvas.id.split('A')[1]}`];
    _specA.isRfMode = !isRfMode;
    props.handleRfClick(_specA);

    window.sewApp.announceSpecAChange(specA.whichUnit);
    updateSewAppContext();
  };

  const handlePauseClicked = () => {
    const specA = sewApp[`specA${whichSpecA}`];
    specA.isPause = !specA.isPause;
    setIsPause(!isPause);
    const _specA = window.sewApp[`specA${specA.canvas.id.split('A')[1]}`];
    _specA.isPause = !isPause;
    props.handlePauseClicked(_specA);
    window.sewApp.announceSpecAChange(specA.whichUnit);
    updateSewAppContext();
  };

  useEffect(() => {
    updateSpecAwAntennaInfo();
  }, [antenna]);

  const updateSpecAwAntennaInfo = (antenna_id, specA, isRemoteChange = true) => {
    specA ??= window.sewApp[`specA${whichSpecA}`];
    if (!specA) return;
    antenna_id ??= specA.antenna_id;

    specA.antenna_id = antenna_id;
    let { band, hpa, target_id, lock, loopback, offset, operational } = antenna[specA.antenna_id - 1];
    specA.target_id = target_id;
    console.log('updateSpecAwAntennaInfo', specA.antenna_id, specA.target_id);
    console.log(antenna);

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
    window.sewApp[`specA${whichSpecA}`] = specA;
    if (!isRemoteChange) {
      // Dont tell anyone else if they made the change
      window.sewApp.announceSpecAChange(specA.whichUnit);
    }
    updateSewAppContext();
  };

  return (
    <Box sx={SpectrumAnalyzerBoxStyle}>
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <Typography>Span: {sewApp[`specA${whichSpecA}`]?.bw / 1e6} MHz</Typography>
        </Grid>
        <Grid container item sx={{ display: 'flex', alignContent: 'space-between' }} xs={2}>
          <Grid item xs={12}>
            <Typography>{sewApp[`specA${whichSpecA}`]?.maxDecibels} (dB)</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography>{sewApp[`specA${whichSpecA}`]?.minDecibels} (dB)</Typography>
          </Grid>
        </Grid>
        <Grid container item sx={canvasContainer} xs={9}>
          <canvas id={props.canvasId} />
        </Grid>
        <Grid item xs={12}>
          <Typography>CF: {sewApp[`specA${whichSpecA}`]?.centerFreq / 1e6} MHz</Typography>
        </Grid>
        <Grid item xs={3}>
          <Box sx={sxInputRow}>
            <label htmlFor='Antenna'>Ant</label>
            <select
              name='Antenna'
              value={sewApp[`specA${whichSpecA}`]?.antenna_id}
              onChange={e => updateSpecAwAntennaInfo(parseInt(e.target.value), sewApp[`specA${whichSpecA}`], false)}>
              <option value={1}>1</option>
              <option value={2}>2</option>
            </select>
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Button
            sx={configButtonStyle}
            onClick={() => props.handleConfigClick(sewApp[`specA${whichSpecA}`], sewApp[`specA${whichSpecA}`])}>
            Config
          </Button>
        </Grid>
        <Grid item xs={3}>
          <Button
            sx={{
              ...configButtonStyle,
              ...{
                backgroundColor: sewApp[`specA${whichSpecA}`]?.isRfMode ? 'red' : 'yellow',
                color: sewApp[`specA${whichSpecA}`]?.isRfMode ? 'white' : 'black',
              },
            }}
            onClick={handleRfClicked}>
            {sewApp[`specA${whichSpecA}`]?.isRfMode ? 'RF' : 'IF'}
          </Button>
        </Grid>
        <Grid item xs={3}>
          <Button
            sx={{
              ...configButtonStyle,
              ...{
                backgroundColor: sewApp[`specA${whichSpecA}`]?.isPause ? 'red' : 'yellow',
                color: sewApp[`specA${whichSpecA}`]?.isPause ? 'white' : 'black',
              },
            }}
            onClick={handlePauseClicked}>
            {sewApp[`specA${whichSpecA}`]?.isPause ? 'Unpause' : 'Pause'}
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
