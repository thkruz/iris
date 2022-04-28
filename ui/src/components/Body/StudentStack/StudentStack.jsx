import React from 'react';
import { TeamInfo, RxModem } from '../..';
import { Box, Grid } from '@mui/material';
import { tmpRxData } from './tmpRxData.js'; // TODO: This needs to come from an api call

// MUI Stack: https://mui.com/material-ui/react-stack/

export const StudentStack = () => {
  const RxCase = () => {
    const units = [1, 2, 3, 4];
    return units.map((x, index) => (
      <Grid key={index} item sx={{ margin: 'auto', padding: '5px' }} xs={12}>
        <RxModem unit={x} tmpRxData={tmpRxData.filter((y) => y.unit === x)} />
      </Grid>
    ));
  };

  return (
    <>
      <TeamInfo />
      <Grid container spacing={1} padding={1}>
        {/* /////////////////////////////// 
                    Spectrum Analyzer
          /////////////////////////////// */}
        <Grid container item spacing={1} xs={12}>
          <Grid item xs={3}>
            <Box sx={{ backgroundColor: '#f5f5f5', textAlign: 'center' }}>
              <h1>Spectrum Analyzer</h1>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Box sx={{ backgroundColor: '#f5f5f5', textAlign: 'center' }}>
              <h1>Spectrum Analyzer</h1>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Box sx={{ backgroundColor: '#f5f5f5', textAlign: 'center' }}>
              <h1>Spectrum Analyzer</h1>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Box sx={{ backgroundColor: '#f5f5f5', textAlign: 'center' }}>
              <h1>Spectrum Analyzer</h1>
            </Box>
          </Grid>
        </Grid>
        {/* /////////////////////////////// 
                    Bottom Half
          /////////////////////////////// */}
        <Grid container item spacing={1} xs={6}>
          {/* Antennas */}
          <Grid container item alignContent={'center'} spacing={1} xs={12}>
            <Grid item xs={6}>
              <Box sx={{ backgroundColor: '#f5f5f5', textAlign: 'center' }}>
                <h1>Antenna A</h1>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ backgroundColor: '#f5f5f5', textAlign: 'center' }}>
                <h1>Antenna B</h1>
              </Box>
            </Grid>
          </Grid>
          <Grid container item alignContent={'center'} spacing={1} xs={12}>
            {[1, 2, 3, 4].map((x) => (
              <Grid key={x} item xs={12}>
                <Box sx={{ backgroundColor: '#f5f5f5', textAlign: 'center' }}>
                  <h1>Transmitter Case {x}</h1>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid container item sx={{ margin: 'auto' }} xs={6}>
          <RxCase />
        </Grid>
      </Grid>
    </>
  );
};
