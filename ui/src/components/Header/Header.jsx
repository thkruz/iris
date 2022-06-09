import React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Logout from '@mui/icons-material/Logout';
import { AstroTheme } from '../../themes/AstroTheme';
import './Header.css';
import { Link, useNavigate } from 'react-router-dom';

export const Header = () => {
  const auth = true; //TODO: get auth context
  const theme = AstroTheme;
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate(process.env.PUBLIC_URL + '/');
  };
  return (
    <>
      <Box sx={{ flexGrow: 0 }}>
        <AppBar className={'appBar'} position='static'>
          <Toolbar sx={{ backgroundColor: theme.palette.tertiary.dark }}>
            <Link to='/'>
              <img src='./patch.png' alt='patch.png' height='80px'></img>
            </Link>
            <Typography variant='h1' component='div' sx={{ flexGrow: 1, fontFamily: 'Nasa' }}>
              IRIS
            </Typography>
            {auth && (
              <IconButton size='large' onClick={handleLogout} color='inherit'>
                <Logout />
              </IconButton>
            )}
          </Toolbar>
        </AppBar>
      </Box>
    </>
  );
};
