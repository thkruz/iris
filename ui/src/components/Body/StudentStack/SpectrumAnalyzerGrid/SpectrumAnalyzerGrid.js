import { Grid } from '@mui/material';
import React from 'react';
import SpectrumAnalyzer from './SpectrumAnalyzer/SpectrumAnalyzer';

// MUI Grid: https://mui.com/material-ui/react-grid/

const SpectrumAnalyzerGrid = () => (
  <Grid container item spacing={1} xs={12}>
    <Grid item xs={3}>
      <SpectrumAnalyzer />
    </Grid>
    <Grid item xs={3}>
      <SpectrumAnalyzer />
    </Grid>
    <Grid item xs={3}>
      <SpectrumAnalyzer />
    </Grid>
    <Grid item xs={3}>
      <SpectrumAnalyzer />
    </Grid>
  </Grid>
);

export default SpectrumAnalyzerGrid;
