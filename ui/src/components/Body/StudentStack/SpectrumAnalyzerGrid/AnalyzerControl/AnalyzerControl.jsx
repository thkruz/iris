/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { Box, Button, Grid } from '@mui/material';
import { AstroTheme } from '../../../../../themes/AstroTheme';

const popupStyle = {
  backgroundColor: AstroTheme.palette.tertiary.main,
  position: 'absolute',
  minWidth: '60%',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  border: '1px solid',
  borderColor: AstroTheme.palette.tertiary.dark,
  padding: '15px',
  zIndex: '9999',
  color: 'white',
  textAlign: 'center',
  borderRadius: '10px',
  boxShadow: '0px 0px 30px rgba(0, 0, 0, 1)',
};

const fullscreenFadeStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  zIndex: '9998',
};

const controlsGridStyle = {
  display: 'flex',
  padding: '10px',
  justifyContent: 'space-around',
  alignItems: 'center',
};

const yellowButtonStyle = {
  backgroundColor: AstroTheme.palette.warning.main,
  '&:hover': {
    backgroundColor: AstroTheme.palette.warning.Lighten2,
  },
  color: 'black',
  border: '1px solid black',
  boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.5)',
  borderColor: AstroTheme.palette.warning.dark,
  height: '50px',
  margin: 'auto',
};
export const AnalyzerControl = props => {
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
    if (typeof props.currentSpecAnalyzer.resetHoldData !== 'undefined') {
      props.currentSpecAnalyzer.resetHoldData();
      props.currentSpecAnalyzer.isDrawHold = !props.currentSpecAnalyzer.isDrawHold;
      setIsTraceOn(props.currentSpecAnalyzer.isDrawHold);
    }
  };

  // Used for marking max amplitude
  const handleMarkerClick = () => {
    props.currentSpecAnalyzer.isDrawMarker = !props.currentSpecAnalyzer.isDrawMarker;
    setIsMarkerOn(props.currentSpecAnalyzer.isDrawMarker);
  };

  // Used for modifying the center frequency value
  const handleFreqClick = () => {
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
    setNumberSelection('khz');
    setGhz(0);
    setMhz(0);

    if (controlSelection === 'freq') {
      setKhz(props.currentSpecAnalyzer.centerFreq / 1e3);
    } else if (controlSelection === 'span') {
      setKhz(props.currentSpecAnalyzer.bw / 1e3);
    }
  };
  const handleNumberClicked = value => {
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
  };

  return (
    <Box id={'analyzerControlModalOverlay'} style={fullscreenFadeStyle} onClick={e => props.handleBackgroundClick(e)}>
      <h1 style={{ color: 'white', textAlign: 'center' }}>{props.currentSpecAnalyzer.canvas.id}</h1>
      <Box sx={popupStyle}>
        <Grid container sx={controlsGridStyle}>
          <Grid item xs={4}>
            <Grid container sx={{ justifyContent: 'space-around' }}>
              <Grid container item xs={8} sx={{ justifyContent: 'space-around' }}>
                <Box
                  sx={{
                    color: 'black',
                    width: '100%',
                    background: 'white',
                    border: '2px solid',
                    padding: '8px',
                    borderColor: AstroTheme.palette.tertiary.dark,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Grid
                    container
                    sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'stretch' }}>
                    <Grid
                      item
                      xs={6}
                      sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <h2>{ghz ? ghz.toString() : '0'}</h2>
                      <h2>{mhz ? mhz.toString() : '0'}</h2>
                      <h2>{khz ? khz.toString() : '0'}</h2>
                    </Grid>
                    <Grid
                      item
                      xs={6}
                      sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <h2>GHz</h2>
                      <h2>MHz</h2>
                      <h2>KHz</h2>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
              <Grid container item xs={4} sx={{ padding: '8px', justifyContent: 'space-around', alignItems: 'center' }}>
                <Grid item xs={12}>
                  <Button
                    sx={{
                      ...yellowButtonStyle,
                      ...{
                        background:
                          numberSelection === 'ghz' ? AstroTheme.palette.normal.main : AstroTheme.palette.warning.main,
                      },
                    }}
                    onClick={handleGhzSelectClick}>
                    <h2>&#8249;</h2>
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    sx={{
                      ...yellowButtonStyle,
                      ...{
                        background:
                          numberSelection === 'mhz' ? AstroTheme.palette.normal.main : AstroTheme.palette.warning.main,
                      },
                    }}
                    onClick={handleMhzSelectClick}>
                    <h2>&#8249;</h2>
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    sx={{
                      ...yellowButtonStyle,
                      ...{
                        background:
                          numberSelection === 'khz' ? AstroTheme.palette.normal.main : AstroTheme.palette.warning.main,
                      },
                    }}
                    onClick={handleKhzSelectClick}>
                    <h2>&#8249;</h2>
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid container item sx={{ rowGap: '10px', padding: '20px' }} xs={2}>
            <Grid item xs={12}>
              <Button
                sx={{
                  ...yellowButtonStyle,
                  ...{
                    background:
                      controlSelection === 'freq' ? AstroTheme.palette.normal.main : AstroTheme.palette.warning.main,
                  },
                }}
                onClick={handleFreqClick}>
                <h2>Freq</h2>
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                sx={{
                  ...yellowButtonStyle,
                  ...{
                    background:
                      controlSelection === 'span' ? AstroTheme.palette.normal.main : AstroTheme.palette.warning.main,
                  },
                }}
                onClick={handleSpanClick}>
                <h2>Span</h2>
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                sx={{
                  ...yellowButtonStyle,
                  ...{ background: isTraceOn ? AstroTheme.palette.critical.main : AstroTheme.palette.warning.main },
                }}
                onClick={handleHoldClick}>
                <h2>Trace</h2>
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                sx={{
                  ...yellowButtonStyle,
                  ...{ background: isMarkerOn ? AstroTheme.palette.critical.main : AstroTheme.palette.warning.main },
                }}
                onClick={handleMarkerClick}>
                <h2>Marker</h2>
              </Button>
            </Grid>
          </Grid>
          <Grid item sx={{ padding: '20px' }} xs={4}>
            <Grid container sx={{ justifyContent: 'space-around' }}>
              <Grid container item xs={12}>
                <Grid item xs={4}>
                  <Button sx={yellowButtonStyle} onClick={() => handleNumberClicked(7)}>
                    <h2>7</h2>
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button sx={yellowButtonStyle} onClick={() => handleNumberClicked(8)}>
                    <h2>8</h2>
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button sx={yellowButtonStyle} onClick={() => handleNumberClicked(9)}>
                    <h2>9</h2>
                  </Button>
                </Grid>
              </Grid>
              <Grid container item xs={12}>
                <Grid item xs={4}>
                  <Button sx={yellowButtonStyle} onClick={() => handleNumberClicked(4)}>
                    <h2>4</h2>
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button sx={yellowButtonStyle} onClick={() => handleNumberClicked(5)}>
                    <h2>5</h2>
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button sx={yellowButtonStyle} onClick={() => handleNumberClicked(6)}>
                    <h2>6</h2>
                  </Button>
                </Grid>
              </Grid>
              <Grid container item xs={12}>
                <Grid item xs={4}>
                  <Button sx={yellowButtonStyle} onClick={() => handleNumberClicked(1)}>
                    <h2>1</h2>
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button sx={yellowButtonStyle} onClick={() => handleNumberClicked(2)}>
                    <h2>2</h2>
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button sx={yellowButtonStyle} onClick={() => handleNumberClicked(3)}>
                    <h2>3</h2>
                  </Button>
                </Grid>
              </Grid>
              <Grid container item xs={12}>
                <Grid item xs={4}>
                  <Button sx={yellowButtonStyle} onClick={() => handleNumberClicked('-')}>
                    <h2>-</h2>
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button sx={yellowButtonStyle} onClick={() => handleNumberClicked(0)}>
                    <h2>0</h2>
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button sx={yellowButtonStyle} onClick={() => handleNumberClicked('.')}>
                    <h2>.</h2>
                  </Button>
                </Grid>
              </Grid>
              <Grid container item xs={12}>
                <Grid item xs={4}>
                  <Button sx={yellowButtonStyle} onClick={() => handleNumberClicked('bksp')}>
                    <h2>bskp</h2>
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button sx={yellowButtonStyle} onClick={() => handleNumberClicked('C')}>
                    <h2>C</h2>
                  </Button>
                </Grid>
                <Grid item xs={4}></Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};
