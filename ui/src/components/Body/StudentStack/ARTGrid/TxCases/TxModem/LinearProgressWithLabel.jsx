import LinearProgress from '@mui/material/LinearProgress';
import React from 'react';
import { Box, Typography } from '@mui/material';
import { PropTypes } from 'prop-types';

export const LinearProgressWithLabel = props => {
  const MED = 75;
  const HIGH = 90;
  const rawPw = Math.round(props.value);
  const pw = Math.min(100, rawPw);
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1, ml: 1 }}>
        {pw < MED ? <LinearProgress variant='determinate' {...props} value={pw} /> : null}
        {pw >= MED && pw < HIGH ? <LinearProgress variant='determinate' {...props} value={pw} color={'error'} /> : null}
        {pw >= HIGH ? (
          <LinearProgress
            variant={rawPw > 100 ? 'indeterminate' : 'determinate'}
            {...props}
            value={pw}
            color={'critical'}
          />
        ) : null}
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant='body2' color='text.secondary'>
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
