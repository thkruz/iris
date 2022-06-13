import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import GitHubIcon from '@mui/icons-material/GitHub';
import Logout from '@mui/icons-material/Logout';
import { AstroTheme } from '../../themes/AstroTheme';
import './Header.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Grid, Modal, Tooltip } from '@mui/material';
import { sxModal } from '../styles/sxModal';

export const Header = () => {
  const [isHelpModalActive, setIsHelpModalActive] = useState(false);
  const { state } = useLocation();
  const theme = AstroTheme;
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <>
      <Modal open={isHelpModalActive} onClose={() => setIsHelpModalActive(false)}>
        <Box sx={{ ...sxModal, ...{ color: AstroTheme.palette.tertiary.light4 } }}>
          <Typography m={1} variant='h3'>
            IRIS Space Electronic Warfare Sandbox
          </Typography>
          <Typography m={1} variant='h5'>
            Introduction
          </Typography>
          <Typography ml={1} mr={1} variant='body1'>
            IRIS is a training environment to help learn how Space Electronic Warfare works. In front of you are:
          </Typography>
          <ul>
            <li>4x Spectrum Analyzers</li>
            <li>2x Antennas</li>
            <li>4x Transmitter Cases</li>
            <li>16x Transmitter Modems</li>
            <li>4x Receiver Cases</li>
            <li>16x Receiver Modems</li>
          </ul>
          <Typography ml={1} mr={1} variant='body1'>
            Using this equipment you can analyze satellites, determine the signals they are transmitting, view video
            feeds on those signals, and then generate your own signals to degrade or disable them.
          </Typography>
          <Typography m={1} variant='h5'>
            Example Scenario
          </Typography>
          <Typography ml={1} mr={1} mb={1} variant='body1'>
            Satellite ARKE 3G is currently transmitting a UAV video feed in C-Band at frequency 4810 Mhz. Intel
            assessment is that they are utilizing 8QAM modulation and a forward error correction (FEC) of 3/4.
          </Typography>
          <Typography ml={1} mr={1} mb={1} variant='body1'>
            Your transmitters and receivers operate with an intermediate frequency (IF) in L-Band. When they are
            converted to C-Band the IF will increase by 3350 Mhz. When it is then downcoverted back to L-Band it will
            decrease by 3500 Mhz.
          </Typography>
          <Typography ml={1} mr={1} variant='body1'>
            Since the satellite cannot transmit and receive on the same frequency, it will offset the frequency it
            receives by 400 Mhz. With all of this information, see if you can find the signal on ARKE 3G and disrupt it
            with your transmitters!
          </Typography>
          <Typography m={1} variant='h5'>
            Why So Much Equipment?
          </Typography>
          <Typography ml={1} mr={1} mb={1} variant='body1'>
            Students in the United States Space Force often work in teams sharing equipment. In order to accurate mimic
            this you have access to all of the equipment on your screen. If you are connected to a server (not Github)
            then your changes will impact other students in your server. If you are playing alone, then you most likely
            will not need all of the equipment.
          </Typography>
        </Box>
      </Modal>
      <AppBar className={'appBar'} position='static'>
        <Toolbar sx={{ backgroundColor: theme.palette.tertiary.dark }}>
          <Grid container>
            <Grid item xs={'auto'}>
              <Tooltip title='Home' placement='bottom'>
                <Button onClick={() => navigate('/')}>
                  <img src='./patch.png' alt='patch.png' height='80px'></img>
                </Button>
              </Tooltip>
            </Grid>
            <Grid item xs={true} container spacing={1}>
              <Grid item xs={12} mt={-1} mb={-5}>
                <Typography fontSize={'64px'} fontFamily={'Nasa'}>
                  IRIS
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography fontSize={'24px'} sx={{ fontFamily: 'Nasa', color: AstroTheme.palette.tertiary.light3 }}>
                  Space Electronic Warfare Sandbox
                </Typography>
              </Grid>
            </Grid>
            <Grid
              item
              xs={'auto'}
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}>
              <Tooltip title='View Code on Github' placement='bottom'>
                <IconButton target='_blank' href='http://github.com/thkruz/iris' size='large' color='inherit'>
                  <GitHubIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title='Help' placement='bottom'>
                <IconButton
                  size='large'
                  onClick={() => {
                    setIsHelpModalActive(true);
                  }}
                  color='inherit'>
                  <HelpCenterIcon />
                </IconButton>
              </Tooltip>
              {state?.isAuthenticated && (
                <Tooltip title='Logout' placement='bottom'>
                  <IconButton size='large' onClick={handleLogout} color='inherit'>
                    <Logout />
                  </IconButton>
                </Tooltip>
              )}
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    </>
  );
};
