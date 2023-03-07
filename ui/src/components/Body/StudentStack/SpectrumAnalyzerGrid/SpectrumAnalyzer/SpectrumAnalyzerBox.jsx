import { Grid} from '@mui/material';
import { SpectrumAnalyzer } from '../../../../';
import React, { useLayoutEffect, useState } from 'react';
import { RuxContainer, RuxButton, RuxButtonGroup, RuxPushButton, RuxIcon, RuxTooltip, RuxSelect, RuxOption, } from '@astrouxds/react'
//import { AstroTheme } from '../../../../../themes/AstroTheme.js';
import { useEffect } from 'react';
import { satellites } from '../../../../../constants';
import PropTypes from 'prop-types';
import config from '../../../../../constants/config';
import { useSewApp } from '../../../../../context/sewAppContext';
import { githubCheck } from '../../../../../lib/github-check';
import SpecAHelp from '../../HelpModals/SpecAHelp';
import './SpectrumAnalyzer.css'
// import { InstructionsIcon } from './../../HelpModals/InstructionsIcon';
import useSound from 'use-sound';
import { selectSound } from '../../../../../audio';

const ApiUrl = config[process.env.REACT_APP_NODE_ENV || 'development'].apiUrl;
// If this is github then use a local file instead
const specADataLocation = !githubCheck() ? `${ApiUrl}/data/spec_a` : './data/spec_a.json';

const canvasContainer = {
  position: 'relative',
  // border: '8px solid transparent',
  // borderImageSource: 'url(./bezel.png)',
  // borderImageSlice: '30 fill',
  // borderImageOutset: 0,
   overflow: 'hidden',
  // boxShadow: '0px 0px 10px rgba(0,0,0,0.5)',
  // backgroundColor: '#282a2b',
  // borderRadius: '10px',
};

export const SpectrumAnalyzerBox = (props) => {
  const [playSelectSound] = useSound(selectSound);
  const [isHelpModalActive, setIsHelpModalActive] = useState(false);
  const [isRfMode, setIsRfMode] = useState(false);
  const [isPause, setIsPause] = useState(false);
  const sewAppCtx = useSewApp();
  const whichSpecA = props.canvasId.split('A')[1];

  useEffect(() => {
    window.sewApp.socket?.on('updateSpecA', (data) => {
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
        const { target_id } = sewAppCtx.antenna[specA.antenna_id - 1];
        specA.target_id = target_id;

        specA.changeCenterFreq(specA.isRfMode ? specA.config.rf.freq : specA.config.if.freq);
        specA.changeBandwidth(specA.isRfMode ? specA.config.rf.span : specA.config.if.span);

        window.sewApp[`specA${whichSpecA}`] = specA;
        sewAppCtx.updateSewApp();
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
      refreshRate: 10, // per second
      noiseFloor: -115,
      isShowSignals: false,
      locked: false,
      operational: false,
    };

    fetch(specADataLocation).then((res) => {
      res.json().then((data) => {
        const specA = new SpectrumAnalyzer(canvasDom, defaultSpecAConfig);

        data = data.filter((specA_DB) => specA_DB.unit === specA.whichUnit && specA_DB.team_id === 1); // TODO Allow other teams!
        const ifData = data.filter((specA_DB) => !specA_DB.rf)[0];
        const rfData = data.filter((specA_DB) => specA_DB.rf)[0];
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

        specA.antenna_id = data[0].antenna_id;
        const { target_id } = sewAppCtx.antenna[specA.antenna_id - 1];
        specA.target_id = target_id;

        specA.changeCenterFreq(specA.isRfMode ? specA.config.rf.freq : specA.config.if.freq);
        specA.changeBandwidth(specA.isRfMode ? specA.config.rf.span : specA.config.if.span);

        loadSignals(specA);
        specA.start();

        window.sewApp[`specA${whichSpecA}`] = specA;
        window[`specA${whichSpecA}`] = specA;
        sewAppCtx.updateSewApp();
      });
    });
  }, []);

  const loadSignals = (specA) => {
    if (window.sewApp.environment.signals.length > 0) {
      window.sewApp.environment.signals.forEach((signal) => {
        specA.signals.push({
          rf: true,
          freq: signal.frequency * 1e6,
          amp: signal.power,
          bw: signal.bandwidth * 1e6,
          target_id: signal.target_id,
        });
      });
      window.sewApp[`specA${whichSpecA}`] = specA;
      sewAppCtx.updateSewApp();
    } else {
      setTimeout(() => {
        loadSignals(specA);
      }, 1000);
    }
  };

  useEffect(() => {
    const specA = sewAppCtx.sewApp[`specA${whichSpecA}`];
    if (!specA || !specA.antenna_id) return;
    const { target_id } = sewAppCtx.antenna[specA.antenna_id - 1];
    specA.target_id = target_id;
    sewAppCtx.updateSewApp();
  }, [sewAppCtx.antenna, sewAppCtx.sewApp[`specA${whichSpecA}`]]);

  const handleRfClicked = () => {
    playSelectSound();
    const specA = sewAppCtx.sewApp[`specA${whichSpecA}`];
    specA.isRfMode = !specA.isRfMode;
    specA.changeCenterFreq(specA.isRfMode ? specA.config.rf.freq : specA.config.if.freq);
    specA.changeBandwidth(specA.isRfMode ? specA.config.rf.span : specA.config.if.span);
    setIsRfMode(!isRfMode);
    const _specA = window.sewApp[`specA${specA.canvas.id.split('A')[1]}`];
    _specA.isRfMode = !isRfMode;
    props.handleRfClick(_specA);

    window.sewApp.announceSpecAChange(specA.whichUnit);
    sewAppCtx.updateSewApp();
  };

  const handlePauseClicked = () => {
    playSelectSound();
    const specA = sewAppCtx.sewApp[`specA${whichSpecA}`];
    specA.isPause = !specA.isPause;
    setIsPause(!isPause);
    const _specA = window.sewApp[`specA${specA.canvas.id.split('A')[1]}`];
    _specA.isPause = !isPause;
    props.handlePauseClicked(_specA);
    window.sewApp.announceSpecAChange(specA.whichUnit);
    sewAppCtx.updateSewApp();
  };

  useEffect(() => {
    updateSpecAwAntennaInfo();
  }, [sewAppCtx.antenna]);

  const updateSpecAwAntennaInfo = (antenna_id, specA, isRemoteChange = true) => {
    specA ??= window.sewApp[`specA${whichSpecA}`];
    if (!specA) return;
    antenna_id ??= specA.antenna_id;

    specA.antenna_id = antenna_id;
    let { band, hpa, target_id, locked, loopback, offset, operational } = sewAppCtx.antenna[specA.antenna_id - 1];
    specA.target_id = target_id;
    //console.log('updateSpecAwAntennaInfo', specA.antenna_id, specA.target_id);
    //console.log(antenna);

    specA.hpa = hpa;
    specA.loopback = loopback;
    specA.locked = locked;
    specA.operational = operational;

    band = band === 0 ? 'c' : 'ku';
    const bandOffset = window.sewApp.constants.antennas.filter((antenna) => antenna.band.toLowerCase() === band)[0];
    specA.downconvertOffset = bandOffset.downconvert;
    specA.upconvertOffset = bandOffset.upconvert;
    if (!loopback) {
      // RF Settings
      specA.targetOffset = satellites.filter((target) => target.id === target_id)[0].offset;
    } else {
      // IF Settings
      specA.antennaOffset = offset * 1e6;
    }
    window.sewApp[`specA${whichSpecA}`] = specA;
    if (!isRemoteChange) {
      // Dont tell anyone else if they made the change
      window.sewApp.announceSpecAChange(specA.whichUnit);
    }
    sewAppCtx.updateSewApp();
  };

  return (
    <>
      <SpecAHelp modalState={isHelpModalActive} setModalState={setIsHelpModalActive} />
      <RuxContainer>
        <Grid container spacing={0}>
          <Grid item xs={11} textAlign={'center'}>
            <p>Span: {sewAppCtx.sewApp[`specA${whichSpecA}`]?.bw / 1e6} MHz</p>
          </Grid>
          <Grid item xs={1} style={{display: 'flex', justifyContent: 'flex-end'}}>
            <RuxTooltip message='Spectrum Analyzer Help' placement='top'>
              <RuxIcon
                icon='help-outline'
                size='24px'
                className='helpIcon'
                onClick={() => {
                  setIsHelpModalActive(true);
                }}>
              </RuxIcon>
            </RuxTooltip>
          </Grid>
          <Grid item sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'right', paddingRight: '4px' }} xs={2}>
              <p>{sewAppCtx.sewApp[`specA${whichSpecA}`]?.maxDecibels} (dB)</p>
              <p>{sewAppCtx.sewApp[`specA${whichSpecA}`]?.minDecibels} (dB)</p>
          </Grid>
          <Grid sx={canvasContainer} item xs={10}>
              <canvas id={props.canvasId} />
          </Grid>
          <Grid item xs={12} style={{textAlign: 'center'}}>
            <p>CF: {sewAppCtx.sewApp[`specA${whichSpecA}`]?.centerFreq / 1e6} MHz</p>
          </Grid>
          <Grid container xs={12}>
            <Grid item xs={3}>
              <RuxSelect 
                label="Ant"
                className='antenna-select'
                value={sewAppCtx.sewApp[`specA${whichSpecA}`]?.antenna_id} 
                name='Antenna'
                onRuxchange={(e) =>
                  updateSpecAwAntennaInfo(parseInt(e.target.value), sewAppCtx.sewApp[`specA${whichSpecA}`], false)
                }
                >
                <RuxOption value={1} label="1">1</RuxOption>
                <RuxOption value={2} label="2">2</RuxOption>
              </RuxSelect>
            </Grid>
            <Grid item xs={9}>
              <RuxButtonGroup style={{ marginLeft: 'auto', marginTop: 'auto', }} hAlign='right'>
                <RuxTooltip 
                  placement='top'
                  message='Open Spectrum Analyzer Configuration'>
                  <RuxButton
                    style={{ marginLeft: '8px', marginRight: '8px', }}
                    onClick={() => {
                      playSelectSound();
                      props.handleConfigClick(
                        sewAppCtx.sewApp[`specA${whichSpecA}`],
                        sewAppCtx.sewApp[`specA${whichSpecA}`]
                      );
                    }}>
                    Config
                  </RuxButton>
                </RuxTooltip>
                <RuxTooltip
                  placement='top'
                  message={
                    sewAppCtx.sewApp[`specA${whichSpecA}`]?.isRfMode
                      ? 'Swith to Intermediate Frequency'
                      : 'Switch to Radio Frequency'
                  }>
                  <RuxPushButton style={{ marginRight: '8px', }} label={sewAppCtx.sewApp[`specA${whichSpecA}`]?.isRfMode ? 'RF' : 'IF'} onRuxchange={handleRfClicked} />
                </RuxTooltip>
                <RuxTooltip
                  placement='top-start'
                  message={
                    sewAppCtx.sewApp[`specA${whichSpecA}`]?.isPause
                      ? 'Unpause the Spectrum Analyzer'
                      : 'Pause the Spectrum Analyzer'
                  }>
                  <RuxPushButton label="Pause" onRuxchange={handlePauseClicked} />
                </RuxTooltip>
              </RuxButtonGroup>
            </Grid>
          </Grid>
        </Grid>
      </RuxContainer>
    </>
  );
};

SpectrumAnalyzerBox.propTypes = {
  canvasId: PropTypes.any,
  handleConfigClick: PropTypes.any,
  handleRfClick: PropTypes.any,
  handlePauseClicked: PropTypes.any,
};
