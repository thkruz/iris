import React, { useEffect, useState } from 'react';
import { RuxButton, RuxCard, RuxPushButton } from '@astrouxds/react'
import { Box, Grid } from '@mui/material';
// import { AstroTheme } from '../../../../../themes/AstroTheme';
import { PropTypes } from 'prop-types';
// import { PhysicalButton } from '../../../PhysicalButton';
import useSound from 'use-sound';
import { selectSound } from '../../../../../audio';

// const popupStyle = {
//   backgroundColor: '#1b2d3e',
//   position: 'absolute',
//   minWidth: '60%',
//   top: '50%',
//   left: '50%',
//   transform: 'translate(-50%, -50%)',
//   border: '1px solid transparent',
//   zIndex: '9999',
//   color: 'white',
//   textAlign: 'center',
//   borderRadius: '3px',
//   boxShadow: '0px 0px 12px 5px rgba(0, 0, 0, 1)',
// };

// const fullscreenFadeStyle = {
//   position: 'fixed',
//   top: 0,
//   left: 0,
//   width: '100%',
//   height: '100%',
//   backgroundColor: 'rgba(0, 0, 0, 0.4)',
//   zIndex: '9998',
// };

const controlsGridStyle = {
  display: 'flex',
  backgroundColor: '#1b2d3e',
  padding: '10px',
  justifyContent: 'space-around',
  alignItems: 'center',
};

export const AnalyzerControl = (props) => {
  const [playSelectSound] = useSound(selectSound);
  const [ghz, setGhz] = useState(null);
  const [mhz, setMhz] = useState(null);
  const [khz, setKhz] = useState(null);
  const [isTraceOn, setIsTraceOn] = useState(false);
  const [isMarkerOn, setIsMarkerOn] = useState(false);
  const [controlSelection, setControlSelection] = useState(null);
  const [numberSelection, setNumberSelection] = useState(null);

  // Initialize the frequency values
  useEffect(() => {
    setNumberSelection('mhz');
    setGhz(0);
    setKhz(0);

    if (!mhz) {
      setMhz(props.currentSpecAnalyzer.centerFreq / 1e6);
    }

    setIsTraceOn(props.currentSpecAnalyzer.isDrawHold);
    setControlSelection('freq');
  }, []);

  // Used for holding max amplitude
  const handleHoldClick = () => {
    playSelectSound();
    if (typeof props.currentSpecAnalyzer.resetHoldData !== 'undefined') {
      props.currentSpecAnalyzer.resetHoldData();
      props.currentSpecAnalyzer.isDrawHold = !props.currentSpecAnalyzer.isDrawHold;
      setIsTraceOn(props.currentSpecAnalyzer.isDrawHold);
    }
  };

  // Used for marking max amplitude
  const handleMarkerClick = () => {
    playSelectSound();
    props.currentSpecAnalyzer.isDrawMarker = !props.currentSpecAnalyzer.isDrawMarker;
    setIsMarkerOn(props.currentSpecAnalyzer.isDrawMarker);
  };

  // Used for modifying the center frequency value
  const handleFreqClick = () => {
    playSelectSound();
    const centerFreq =
      props.currentSpecAnalyzer.maxFreq - (props.currentSpecAnalyzer.maxFreq - props.currentSpecAnalyzer.minFreq) / 2;
    let _ghz, _mhz, _khz;
    if (numberSelection === 'ghz') {
      _ghz = centerFreq / 1e9;
      setGhz(_ghz);
    } else if (numberSelection === 'mhz') {
      _mhz = centerFreq / 1e6;
      setMhz(_mhz);
    } else if (numberSelection === 'khz') {
      _khz = centerFreq / 1e3;
      setKhz(_khz);
    } else {
      // TODO: Provide user feedback
      return;
    }
    setControlSelection('freq');
  };
  // Used for modifying the span value
  const handleSpanClick = () => {
    playSelectSound();
    const bw = props.currentSpecAnalyzer.bw;
    let _ghz, _mhz, _khz;
    if (numberSelection === 'ghz') {
      _ghz = bw / 1e9;
      setGhz(_ghz);
    } else if (numberSelection === 'mhz') {
      _mhz = bw / 1e6;
      setMhz(_mhz);
    } else if (numberSelection === 'khz') {
      _khz = bw / 1e3;
      setKhz(_khz);
    } else {
      // TODO: Provide user feedback
      return;
    }
    setControlSelection('span');
  };
  const handleGhzSelectClick = () => {
    playSelectSound();
    setNumberSelection('ghz');
    setMhz(0);
    setKhz(0);

    if (controlSelection === 'freq') {
      setGhz(props.currentSpecAnalyzer.centerFreq / 1e9);
    } else if (controlSelection === 'span') {
      setGhz(props.currentSpecAnalyzer.bw / 1e9);
    }
  };
  const handleMhzSelectClick = () => {
    playSelectSound();
    setNumberSelection('mhz');
    setGhz(0);
    setKhz(0);

    if (controlSelection === 'freq') {
      setMhz(props.currentSpecAnalyzer.centerFreq / 1e6);
    } else if (controlSelection === 'span') {
      setMhz(props.currentSpecAnalyzer.bw / 1e6);
    }
  };
  const handleKhzSelectClick = () => {
    playSelectSound();
    setNumberSelection('khz');
    setGhz(0);
    setMhz(0);

    if (controlSelection === 'freq') {
      setKhz(props.currentSpecAnalyzer.centerFreq / 1e3);
    } else if (controlSelection === 'span') {
      setKhz(props.currentSpecAnalyzer.bw / 1e3);
    }
  };
  const handleNumberClicked = (value) => {
    playSelectSound();
    let _ghz, _mhz, _khz;
    if (numberSelection === 'ghz') {
      _ghz = ghz;
      if (value === 'bksp') {
        _ghz = _ghz.toString().slice(0, -1);
      } else if (value === '.') {
        _ghz = _ghz + '.';
      } else if (value === 'C') {
        _ghz = '';
      } else {
        _ghz = `${_ghz}${value}`;
      }

      if (controlSelection === 'freq') props.currentSpecAnalyzer.changeCenterFreq(parseFloat(_ghz * 1e9));
      if (controlSelection === 'span') props.currentSpecAnalyzer.changeBandwidth(parseFloat(_ghz * 1e9));
      setGhz(_ghz);
    } else if (numberSelection === 'mhz') {
      _mhz = mhz;
      if (value === 'bksp') {
        _mhz = _mhz.toString().slice(0, -1);
      } else if (value === '.') {
        _mhz = _mhz + '.';
      } else if (value === 'C') {
        _mhz = '';
      } else {
        _mhz = `${_mhz}${value}`;
      }

      if (controlSelection === 'freq') props.currentSpecAnalyzer.changeCenterFreq(parseFloat(_mhz * 1e6));
      if (controlSelection === 'span') props.currentSpecAnalyzer.changeBandwidth(parseFloat(_mhz * 1e6));
      setMhz(_mhz);
    } else if (numberSelection === 'khz') {
      _khz = khz;
      if (value === 'bksp') {
        _khz = _khz.toString().slice(0, -1);
      } else if (value === '.') {
        _khz = _khz + '.';
      } else if (value === 'C') {
        _khz = '';
      } else {
        _khz = `${_khz}${value}`;
      }

      if (controlSelection === 'freq') props.currentSpecAnalyzer.changeCenterFreq(parseFloat(_khz * 1e3));
      if (controlSelection === 'span') props.currentSpecAnalyzer.changeBandwidth(parseFloat(_khz * 1e3));
      setKhz(_khz);
    } else {
      // TODO: Provide user feedback
      return;
    }

    window.sewApp.announceSpecAChange(props.currentSpecAnalyzer.whichUnit);
  };

  return (
    <Box id={'analyzerControlModalOverlay'} onClick={(e) => props.handleBackgroundClick(e)}>
        <Grid container sx={controlsGridStyle}>
          <Grid item xs={6}>
            <Grid container sx={{ justifyContent: 'space-around' }}>
              <Grid container item xs={10} sx={{ justifyContent: 'space-around' }}>
                <RuxCard className="control-display">
                  <section>
                    <div>
                      <h2>{ghz ? ghz.toString() : '0'}</h2>
                      <h2>{mhz ? mhz.toString() : '0'}</h2>
                      <h2>{khz ? khz.toString() : '0'}</h2>
                    </div>
                    <div>
                      <h2>GHz</h2>
                      <h2>MHz</h2>
                      <h2>KHz</h2>
                    </div >
                  </section>
                </RuxCard>
              </Grid>
              <Grid container item xs={2} sx={{ padding: '8px', justifyContent: 'space-around', alignItems: 'center' }}>
                <Grid item xs={12}>
                  <RuxPushButton checked={numberSelection === 'ghz'} onRuxchange={handleGhzSelectClick} label={'<'} />
                </Grid>
                <Grid item mt={1} mb={1} xs={12}>
                  <RuxPushButton checked={numberSelection === 'mhz'} onRuxchange={handleMhzSelectClick} label={'<'} />
                </Grid>
                <Grid item xs={12}>
                  <RuxPushButton checked={numberSelection === 'khz'} onRuxchange={handleKhzSelectClick} label={'<'} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid container item sx={{ rowGap: '10px', padding: '20px' }} xs={2}>
            <Grid item xs={12}>
              <RuxPushButton checked={controlSelection === 'freq'} onRuxchange={handleFreqClick} label={'Freq'} />
            </Grid>
            <Grid item xs={12}>
              <RuxPushButton checked={controlSelection === 'span'} onRuxchange={handleSpanClick} label={'Span'} />
            </Grid>
            <Grid item xs={12}>
              <RuxPushButton checked={isTraceOn} onRuxchange={handleHoldClick} label={'Trace'} />
            </Grid>
            <Grid item xs={12}>
              <RuxPushButton checked={isMarkerOn} onRuxchange={handleMarkerClick} label={'Marker'} />
            </Grid>
          </Grid>
          <Grid item sx={{ padding: '20px' }} xs={4}>
            <Grid container sx={{ justifyContent: 'space-around' }} spacing={2}>
              <Grid container item xs={12}>
                <Grid item xs={4}>
                  <RuxButton secondary onClick={() => handleNumberClicked(7)}>7</RuxButton>
                </Grid>
                <Grid item xs={4}>
                  <RuxButton secondary onClick={() => handleNumberClicked(8)}>8</RuxButton>
                </Grid>
                <Grid item xs={4}>
                  <RuxButton secondary onClick={() => handleNumberClicked(9)}>9</RuxButton>
                </Grid>
              </Grid>
              <Grid container item xs={12}>
                <Grid item xs={4}>
                  <RuxButton secondary onClick={() => handleNumberClicked(4)}>4</RuxButton>
                </Grid>
                <Grid item xs={4}>
                  <RuxButton secondary onClick={() => handleNumberClicked(5)}>5</RuxButton>
                </Grid>
                <Grid item xs={4}>
                  <RuxButton secondary onClick={() => handleNumberClicked(6)}>6</RuxButton>
                </Grid>
              </Grid>
              <Grid container item xs={12}>
                <Grid item xs={4}>
                  <RuxButton secondary onClick={() => handleNumberClicked(1)}>1</RuxButton>
                </Grid>
                <Grid item xs={4}>
                  <RuxButton secondary onClick={() => handleNumberClicked(2)}>2</RuxButton>
                </Grid>
                <Grid item xs={4}>
                  <RuxButton secondary onClick={() => handleNumberClicked(3)}>3</RuxButton>
                </Grid>
              </Grid>
              <Grid container item xs={12}>
                <Grid item xs={4}>
                  <RuxButton secondary onClick={() => handleNumberClicked('-')}>-</RuxButton>
                </Grid>
                <Grid item xs={4}>
                  <RuxButton secondary onClick={() => handleNumberClicked(0)}>0</RuxButton>
                </Grid>
                <Grid item xs={4}>
                  <RuxButton secondary onClick={() => handleNumberClicked('.')}>
                  .
                  </RuxButton>
                </Grid>
              </Grid>
              <Grid container item xs={12}>
                <Grid item xs={5}>
                  <RuxButton secondary onClick={() => handleNumberClicked('bksp')}>bskp</RuxButton>
                </Grid>
                <Grid item xs={3}></Grid>
                <Grid item xs={4}>
                  <RuxButton secondary onClick={() => handleNumberClicked('C')}>C</RuxButton>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
  );
};

AnalyzerControl.propTypes = {
  currentSpecAnalyzer: PropTypes.object,
  handleBackgroundClick: PropTypes.func,
};
