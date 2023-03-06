import React from 'react';
import { RuxProgress, RuxIndeterminateProgress } from '@astrouxds/react'
import { Box, Typography } from '@mui/material';
import { PropTypes } from 'prop-types';

export const LinearProgressWithLabel = props => {
  const MED = 75;
  const HIGH = 90;
  const rawPw = Math.round(props.value);
  const pw = Math.min(100, rawPw);
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: rawPw < 100 ? '100%' : 'auto', mr: 1, ml: 1 }}>
        {pw < MED ? <RuxProgress {...props} value={pw} hideLabel /> : null}
        {pw >= MED && pw < HIGH ? <RuxProgress {...props} value={pw} color={'error'} hideLabel /> : null}
        {pw >= HIGH ? (
          rawPw > 100 
          ? <RuxIndeterminateProgress
            {...props}
            value={pw}
            color={'critical'}
            hideLabel
          ></RuxIndeterminateProgress> 
          : <RuxProgress
            {...props}
            value={pw}
            color={'critical'}
            hideLabel
          ></RuxProgress>
        ) : null}
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant='body2'>
          {`${rawPw}%`}
        </Typography>
      </Box>
    </Box>
  );
};
LinearProgressWithLabel.propTypes = {
  ...LinearProgressWithLabel.propTypes,
  value: PropTypes.number.isRequired,
};
