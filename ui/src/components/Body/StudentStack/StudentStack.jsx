import React from 'react';
import { TeamInfo, RxModem } from '../..'
import { Box } from '@mui/material';
// MUI Stack: https://mui.com/material-ui/react-stack/

export const StudentStack = () => {
  const RxCase = () => (
    <Box>
      <RxModem unit={1}/>
      <RxModem unit={2}/>
      <RxModem unit={3}/>
      <RxModem unit={4}/>
    </Box>
  )

  return (
    <>
      <TeamInfo />
      <RxCase />
    </>
  );
}