/* eslint-disable react/prop-types */
import React, { useEffect } from 'react';
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
  // console.log(props.currentSpecAnalyzer);
  const [ghz, setGhz] = React.useState(null);
  const [mhz, setMhz] = React.useState(null);
  const [khz, setKhz] = React.useState(null);
  const [isTraceOn, setIsTraceOn] = React.useState(false);
  const [controlSelection, setControlSelection] = React.useState(null);

  // Initialize the frequency values
  useEffect(() => {
    const centerFreq =
      props.currentSpecAnalyzer.maxFreq - (props.currentSpecAnalyzer.maxFreq - props.currentSpecAnalyzer.minFreq) / 2;
    let _ghz, _mhz, _khz;
    if (!ghz) {
      _ghz = centerFreq / 1e9 >= 1 ? centerFreq / 1e9 : 0;
      setGhz(_ghz);
    }
    if (!mhz) {
      _mhz = (centerFreq - _ghz * 1e9) / 1e6 >= 1 ? (centerFreq - _ghz * 1e9) / 1e6 : 0;
      setMhz(_mhz);
    }
    if (!khz) {
      _khz = (centerFreq - _ghz * 1e9 - _mhz * 1e6) / 1e3 >= 1 ? (centerFreq - _ghz * 1e9 - _mhz * 1e6) / 1e3 : 0;
      setKhz(_khz);
    }

    setIsTraceOn(props.currentSpecAnalyzer.isDrawHold);
    setControlSelection('freq');
  }, []);

  // Used for holding max frequency
  const handleTrackClick = () => {
    if (typeof props.currentSpecAnalyzer.resetHoldData !== 'undefined') {
      props.currentSpecAnalyzer.resetHoldData();
      props.currentSpecAnalyzer.isDrawHold = !props.currentSpecAnalyzer.isDrawHold;
      setIsTraceOn(props.currentSpecAnalyzer.isDrawHold);
    }
  };

  // Used for modifying the center frequency value
  const handleFreqClick = () => {
    const centerFreq =
      props.currentSpecAnalyzer.maxFreq - (props.currentSpecAnalyzer.maxFreq - props.currentSpecAnalyzer.minFreq) / 2;
    let _ghz, _mhz, _khz;
    _ghz = centerFreq / 1e9 >= 1 ? centerFreq / 1e9 : 0;
    setGhz(_ghz);
    _mhz = (centerFreq - _ghz * 1e9) / 1e6 >= 1 ? (centerFreq - _ghz * 1e9) / 1e6 : 0;
    setMhz(_mhz);
    _khz = (centerFreq - _ghz * 1e9 - _mhz * 1e6) / 1e3 >= 1 ? (centerFreq - _ghz * 1e9 - _mhz * 1e6) / 1e3 : 0;
    setKhz(_khz);
    setControlSelection('freq');
  };

  // Used for modifying the span value
  const handleSpanClick = () => {
    const spanFreq = props.currentSpecAnalyzer.maxFreq - props.currentSpecAnalyzer.minFreq;
    let _ghz, _mhz, _khz;
    _ghz = spanFreq / 1e9 >= 1 ? spanFreq / 1e9 : 0;
    setGhz(_ghz);
    _mhz = (spanFreq - _ghz * 1e9) / 1e6 >= 1 ? (spanFreq - _ghz * 1e9) / 1e6 : 0;
    setMhz(_mhz);
    _khz = (spanFreq - _ghz * 1e9 - _mhz * 1e6) / 1e3 >= 1 ? (spanFreq - _ghz * 1e9 - _mhz * 1e6) / 1e3 : 0;
    setKhz(_khz);
    setControlSelection('span');
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
                      <h2>{ghz}</h2>
                      <h2>{mhz}</h2>
                      <h2>{khz}</h2>
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
                  <Button sx={yellowButtonStyle}>
                    <h2>&#8249;</h2>
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button sx={yellowButtonStyle}>
                    <h2>&#8249;</h2>
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button sx={yellowButtonStyle}>
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
                onClick={handleTrackClick}>
                <h2>Trace</h2>
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button sx={yellowButtonStyle}>
                <h2>Marker</h2>
              </Button>
            </Grid>
          </Grid>
          <Grid item sx={{ padding: '20px' }} xs={4}>
            <Grid container sx={{ justifyContent: 'space-around' }}>
              <Grid container item xs={12}>
                <Grid item xs={4}>
                  <Button sx={yellowButtonStyle}>
                    <h2>7</h2>
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button sx={yellowButtonStyle}>
                    <h2>8</h2>
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button sx={yellowButtonStyle}>
                    <h2>9</h2>
                  </Button>
                </Grid>
              </Grid>
              <Grid container item xs={12}>
                <Grid item xs={4}>
                  <Button sx={yellowButtonStyle}>
                    <h2>4</h2>
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button sx={yellowButtonStyle}>
                    <h2>5</h2>
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button sx={yellowButtonStyle}>
                    <h2>6</h2>
                  </Button>
                </Grid>
              </Grid>
              <Grid container item xs={12}>
                <Grid item xs={4}>
                  <Button sx={yellowButtonStyle}>
                    <h2>1</h2>
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button sx={yellowButtonStyle}>
                    <h2>2</h2>
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button sx={yellowButtonStyle}>
                    <h2>3</h2>
                  </Button>
                </Grid>
              </Grid>
              <Grid container item xs={12}>
                <Grid item xs={4}>
                  <Button sx={yellowButtonStyle}>
                    <h2>-</h2>
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button sx={yellowButtonStyle}>
                    <h2>0</h2>
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button sx={yellowButtonStyle}>
                    <h2>.</h2>
                  </Button>
                </Grid>
              </Grid>
              <Grid container item xs={12}>
                <Grid item xs={4}>
                  <Button sx={yellowButtonStyle}>
                    <h2>bskp</h2>
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button sx={yellowButtonStyle}>
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