import React from 'react';
import { ARTGrid, SpectrumAnalyzerGrid, TeamInfo } from '../../';
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
