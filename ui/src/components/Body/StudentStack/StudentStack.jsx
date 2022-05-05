import React from 'react';
import { TeamInfo } from '../..';

import SpectrumAnalyzerGrid from './SpectrumAnalyzerGrid/SpectrumAnalyzerGrid';
import ARTGrid from './ARTGrid/ARTGrid';
import { Grid } from '@mui/material';

// MUI Stack: https://mui.com/material-ui/react-stack/

export const StudentStack = () => {
  return (
    <>
      <TeamInfo />
      <Grid container spacing={3} padding={2}>
        <SpectrumAnalyzerGrid />
        <ARTGrid />
      </Grid>
    </>
  );
};
