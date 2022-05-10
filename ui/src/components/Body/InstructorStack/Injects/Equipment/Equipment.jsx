import React from 'react';
import { Typography } from '@mui/material';
import { useTx } from '../../../../../context';
//import { AstroTheme } from '../../../../../themes/AstroTheme';

export const Equipment = () => {
    const txData = useTx();
    //const theme = AstroTheme;

    return (
        <>
            {txData.map((x, index) => (
                <Typography key={index} sx={{color:'white'}}>{x.unit}</Typography>
            ))}
        </>
    );
};