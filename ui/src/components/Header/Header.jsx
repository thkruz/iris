import React, { useEffect, useState }from 'react';
import { RuxDialog, RuxGlobalStatusBar, RuxTooltip, RuxButton, RuxIcon, RuxSwitch } from '@astrouxds/react'
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
// import GitHubIcon from '@mui/icons-material/GitHub';
// import { AstroTheme } from '../../themes/AstroTheme';
import './Header.css';
import { useLocation, useNavigate } from 'react-router-dom';

export const Header = () => {
  // const [isHelpModalActive, setIsHelpModalActive] = useState(false);
  const { state } = useLocation();
  //const theme = AstroTheme;
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  const iconStyles = {
    color: '#FFFFFF',
    cursor: 'pointer',
    padding: '12px',
  }

  const handleClick = () =>{
    const dialog = document.querySelector('.main-help');
    dialog.setAttribute('open', '');
  }

  /*Add Theme Switcher*/
  const [checked, setChecked] = useState(false);
  useEffect(()=>{
    const body = document.querySelector('body');
    if(checked){
      body.classList.add('light-theme')
    } else {
      body.classList.remove('light-theme')
    } 
  },[checked])

  return (
    <>
      <RuxDialog clickToClose header='IRIS Space Electronic Warfare Sandbox' class="main-help">
        <div>
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
        </div>
      </RuxDialog>
      <RuxGlobalStatusBar appDomain='IRIS' appName='Space Electronic Warfare Sandox' style={{position: 'relative',}}>
        <div slot='left-side'>
          <RuxTooltip message='Home' placement='bottom'>
            <RuxButton borderless onClick={() => navigate('/')}>
              <img src='./patch.png' alt='patch.png' height='80px'></img>
            </RuxButton>
          </RuxTooltip>
        </div>
        <div slot='right-side' style={{ display: 'flex', alignItems: 'center' }}>
        <RuxIcon className="switch-indicator" size="small" icon={checked ? "wb-sunny" : "brightness-3"} />
              <RuxSwitch
              id="light-dark-switch"
              checked={checked}
              onRuxchange={()=>setChecked(!checked)} />
          <RuxTooltip message='View Code on Github' placement='bottom'>
            <IconButton target='_blank' href='http://github.com/thkruz/iris' size='large' color='inherit'>
              <svg width="24px"  focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="GitHubIcon"><path fill="white" d="M12 1.27a11 11 0 00-3.48 21.46c.55.09.73-.28.73-.55v-1.84c-3.03.64-3.67-1.46-3.67-1.46-.55-1.29-1.28-1.65-1.28-1.65-.92-.65.1-.65.1-.65 1.1 0 1.73 1.1 1.73 1.1.92 1.65 2.57 1.2 3.21.92a2 2 0 01.64-1.47c-2.47-.27-5.04-1.19-5.04-5.5 0-1.1.46-2.1 1.2-2.84a3.76 3.76 0 010-2.93s.91-.28 3.11 1.1c1.8-.49 3.7-.49 5.5 0 2.1-1.38 3.02-1.1 3.02-1.1a3.76 3.76 0 010 2.93c.83.74 1.2 1.74 1.2 2.94 0 4.21-2.57 5.13-5.04 5.4.45.37.82.92.82 2.02v3.03c0 .27.1.64.73.55A11 11 0 0012 1.27"></path></svg>
            </IconButton>
          </RuxTooltip>
          <RuxTooltip message='Help' placement='bottom'>
            <RuxIcon
              icon='help-outline'
              className='helpIcon'
              size='24px'
              style={iconStyles}
              onClick={() => {
                handleClick()
              }}
              color='inherit'>
            </RuxIcon>
          </RuxTooltip>
          {state?.isAuthenticated && (
            <RuxTooltip message='Logout' placement='bottom'>
              <RuxIcon icon='exit-to-app' size='24px' onClick={handleLogout} style={iconStyles}>
              </RuxIcon>
            </RuxTooltip>
          )}
        </div>
      </RuxGlobalStatusBar>
    </>
  );
};
