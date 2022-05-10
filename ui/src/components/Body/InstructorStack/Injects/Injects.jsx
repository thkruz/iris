import React from 'react';
import { Button, Grid } from '@mui/material';
import { AstroTheme } from '../../../../themes/AstroTheme';
import { Equipment } from '../../../';

export const Injects = () => {
  const theme = AstroTheme;
  const sxButton = {
    width: '100px',
    backgroundColor: theme.palette.primary.light,
    margin: '3px',
    color: 'black'
  };

  return (
    <Grid container>
      <Grid item xs={2}>
        <Button sx={sxButton}>Load</Button>
        <Button sx={sxButton}>Save</Button>
        <Button sx={sxButton}>Create</Button>
        <Button sx={sxButton}>Delete</Button>
        <Button sx={sxButton}>Schedule</Button>
      </Grid>
      <Grid item xs={10}>
        <Equipment />
      </Grid>
    </Grid>
  );
};
