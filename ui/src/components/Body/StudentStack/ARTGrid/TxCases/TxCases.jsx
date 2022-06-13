import React from 'react';
import { Grid } from '@mui/material';
import { TxCase } from './TxCase';

export const TxCases = () => {
  return (
    <>
      <Grid item xs={true} container spacing={2}>
        {[1, 2].map(unit => {
          return <TxCase key={unit} unit={unit} />;
        })}
      </Grid>
      <Grid item xs={true} container spacing={2}>
        {[3, 4].map(unit => {
          return <TxCase key={unit} unit={unit} />;
        })}
      </Grid>
    </>
  );
};
