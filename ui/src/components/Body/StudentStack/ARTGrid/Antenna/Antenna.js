import React from 'react';
import { Grid, Box } from '@mui/material';

const Antenna = () => {
  return (
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
  );
};

export default Antenna;
