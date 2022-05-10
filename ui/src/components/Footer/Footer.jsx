import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';

export const Footer = () => (
    <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
        <Toolbar>
            <Typography>
                Authors: Askins, Gilmore, Hufstetler, Kruczek, Peters
                <br></br>
                United States Space Force Supra Coders: Blended Software Development Immersion #1
            </Typography>
        </Toolbar>
        </AppBar>
    </Box>
);