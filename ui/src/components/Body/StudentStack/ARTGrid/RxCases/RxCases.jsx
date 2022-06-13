import React from 'react';
import { Grid } from '@mui/material';
import { RxCase } from './RxCase';

export const RxCases = () => {
  return (
    <>
      <Grid item xs={true} container spacing={2}>
        {[1, 2].map((unit) => (
          <RxCase unit={unit} key={unit} />
        ))}
      </Grid>
      <Grid item xs={true} container spacing={2}>
        {[3, 4].map((unit) => (
          <RxCase unit={unit} key={unit} />
        ))}
      </Grid>
    </>
  );
};
