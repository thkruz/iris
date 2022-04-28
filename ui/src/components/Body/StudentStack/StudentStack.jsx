import React from 'react';
import { TeamInfo, RxModem } from '../..';
import { Box } from '@mui/material';
import { tmpRxData } from './tmpRxData.js'; // TODO: This needs to come from an api call

// MUI Stack: https://mui.com/material-ui/react-stack/

export const StudentStack = () => {
  const RxCase = () => {
    const units = [1, 2, 3, 4];
    return units.map((x, index) => (
      <Box key={index}>
        <RxModem unit={x} tmpRxData={tmpRxData.filter((y) => y.unit === x)} />
      </Box>
    ));
  };

  return (
    <>
      <TeamInfo />
      <RxCase />
    </>
  );
};
