import React from 'react';
import { Grid } from '@mui/material';
import Receiver from './Receiver/Receiver';
import Antenna from './Antenna/Antenna';
import Transmitter from './Transmitter/Transmitter';

// MUI Grid: https://mui.com/material-ui/react-grid/

const ARTGrid = () => {
  return (
    <>
      <Grid container item spacing={1} xs={6}>
        <Antenna />
        <Transmitter />
      </Grid>
      <Grid container item sx={{ margin: 'auto' }} xs={6}>
        <Receiver />
      </Grid>
    </>
  );
};

export default ARTGrid;
