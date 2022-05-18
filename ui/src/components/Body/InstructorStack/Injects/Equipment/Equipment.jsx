import React from 'react';
import { Table, TableCell, TableContainer, TableHead, TableRow, TableBody } from '@mui/material';
//import { useTx } from '../../../../../context';
//import { AstroTheme } from '../../../../../themes/AstroTheme';
import { PropTypes } from 'prop-types';

export const Equipment = ({ sewApp }) => {
  const headerItems = [
    { name: 'Team' },
    { name: 'Antenna' },
    { name: 'SpecA' },
    { name: 'TX' },
    { name: 'RX' },
    { name: 'Sat1' },
    { name: 'Sat2' },
    { name: 'Sat3' },
    { name: 'Sat4' },
    { name: 'Sat5' },
  ];
  return (
    <>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table>
          <TableHead>
            <TableRow>
              {headerItems.map((item, index) => (
                <TableCell sx={{ color: 'white' }} key={index}>
                  {item.name}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sewApp.environment?.signals.map((signal, index) => (
              <TableRow key={index}>
                <TableCell>{signal.team || 'blue'}</TableCell>
                <TableCell>{signal.antenna || '1'}</TableCell>
                <TableCell>{signal.specA || '1'}</TableCell>
                <TableCell>{signal.tx || '1'}</TableCell>
                <TableCell>{signal.rx || '1'}</TableCell>
                <TableCell>{signal.sat1 || '1'}</TableCell>
                <TableCell>{signal.sat2 || '1'}</TableCell>
                <TableCell>{signal.sat3 || '1'}</TableCell>
                <TableCell>{signal.sat4 || '1'}</TableCell>
                <TableCell>{signal.sat5 || '1'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

Equipment.propTypes = {
  sewApp: PropTypes.any,
};
