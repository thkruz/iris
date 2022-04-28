import React from 'react';
import { Grid, Box } from '@mui/material';

//

const Transmitter = () => {
  return (
    <Grid container item alignContent={'center'} spacing={1} xs={12}>
      {[1, 2, 3, 4].map((x) => (
        <Grid key={x} item xs={12}>
          <Box sx={{ backgroundColor: '#f5f5f5', textAlign: 'center' }}>
            <h1>Transmitter Case {x}</h1>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

export default Transmitter;
