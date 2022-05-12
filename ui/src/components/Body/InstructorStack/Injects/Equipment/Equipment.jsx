import React from 'react';
import { Table, TableCell, TableContainer, TableHead, TableRow, TableBody } from '@mui/material';
//import { useTx } from '../../../../../context';
//import { AstroTheme } from '../../../../../themes/AstroTheme';

export const Equipment = () => {
    const headerItems = [{name: 'Team'}, {name: 'Antenna'}, {name: 'SpecA'}, {name: 'TX'}, {name: 'RX'}, {name: 'Sat1'}, {name: 'Sat2'}, {name: 'Sat3'}, {name: 'Sat4'}, {name: 'Sat5'}]
    return (
        <>
            <TableContainer sx={{ maxHeight: 440 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            {headerItems.map((item, index) => (
                                <TableCell sx={{color: 'white'}} key={index}>
                                    {item.name}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell sx={{color: 'white'}}>Team 1</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};