import React from 'react';
import { TeamInfo, RxModem } from '../..'
import { Box } from '@mui/material';
// MUI Stack: https://mui.com/material-ui/react-stack/

export const StudentStack = () => {
  const tmpRxData = [
    {unit: 1, modem: 1, operational: true, id_antenna: 1, frequency: 1100, bandwidth: 25, modulation: '8QAM', fec: '3/4'},
    {unit: 1, modem: 2, operational: true, id_antenna: 1, frequency: 1200, bandwidth: 35, modulation: 'BPSK', fec: '1/2'},
    {unit: 1, modem: 3, operational: true, id_antenna: 2, frequency: 1300, bandwidth: 45, modulation: 'QPSK', fec: '7/8'},
    {unit: 1, modem: 4, operational: true, id_antenna: 2, frequency: 1400, bandwidth: 55, modulation: '16QAM', fec: '5/6'},
    {unit: 2, modem: 1, operational: true, id_antenna: 1, frequency: 1100, bandwidth: 25, modulation: '8QAM', fec: '3/4'},
    {unit: 2, modem: 2, operational: true, id_antenna: 1, frequency: 1200, bandwidth: 35, modulation: 'BPSK', fec: '1/2'},
    {unit: 2, modem: 3, operational: true, id_antenna: 2, frequency: 1300, bandwidth: 45, modulation: 'QPSK', fec: '7/8'},
    {unit: 2, modem: 4, operational: true, id_antenna: 2, frequency: 1400, bandwidth: 55, modulation: '16QAM', fec: '5/6'},
    {unit: 3, modem: 1, operational: true, id_antenna: 1, frequency: 1100, bandwidth: 25, modulation: '8QAM', fec: '3/4'},
    {unit: 3, modem: 2, operational: true, id_antenna: 1, frequency: 1200, bandwidth: 35, modulation: 'BPSK', fec: '1/2'},
    {unit: 3, modem: 3, operational: true, id_antenna: 2, frequency: 1300, bandwidth: 45, modulation: 'QPSK', fec: '7/8'},
    {unit: 3, modem: 4, operational: true, id_antenna: 2, frequency: 1400, bandwidth: 55, modulation: '16QAM', fec: '5/6'},
    {unit: 4, modem: 1, operational: true, id_antenna: 1, frequency: 1100, bandwidth: 25, modulation: '8QAM', fec: '3/4'},
    {unit: 4, modem: 2, operational: true, id_antenna: 1, frequency: 1200, bandwidth: 35, modulation: 'BPSK', fec: '1/2'},
    {unit: 4, modem: 3, operational: true, id_antenna: 2, frequency: 1300, bandwidth: 45, modulation: 'QPSK', fec: '7/8'},
    {unit: 4, modem: 4, operational: true, id_antenna: 2, frequency: 1400, bandwidth: 55, modulation: '16QAM', fec: '5/6'}
  ];

  const RxCase = () => {
    const units = [];
    [1,2,3,4].forEach((x, index) => {
      units.push(
        <Box key={index}>
          <RxModem unit={x} tmpRxData={tmpRxData.filter(y => y.unit === x)}/>
        </Box>
      );
    });
    return(units)
  }

  return (
    <>
      <TeamInfo />
      <RxCase />
    </>
  );
}