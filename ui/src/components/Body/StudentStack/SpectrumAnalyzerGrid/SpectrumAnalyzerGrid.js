import { Grid } from '@mui/material';
import React from 'react';
import SpectrumAnalyzerBox from './SpectrumAnalyzer/SpectrumAnalyzerBox';

// MUI Grid: https://mui.com/material-ui/react-grid/

const SpectrumAnalyzerGrid = () => (
  <Grid container item spacing={1} xs={12}>
    <Grid item xs={3}>
      <SpectrumAnalyzerBox canvasId={'specA1'} />
    </Grid>
    <Grid item xs={3}>
      <SpectrumAnalyzerBox canvasId={'specA2'} />
    </Grid>
    <Grid item xs={3}>
      <SpectrumAnalyzerBox canvasId={'specA3'} />
    </Grid>
    <Grid item xs={3}>
      <SpectrumAnalyzerBox canvasId={'specA4'} />
    </Grid>
  </Grid>
);

export default SpectrumAnalyzerGrid;
