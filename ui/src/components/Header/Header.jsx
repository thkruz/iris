import React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Logout from '@mui/icons-material/Logout';
import './Header.css'

export const Header = () => {
  const auth = true; //TODO: get auth context

  const handleLogout = () => {
    console.log("logging out")
  }
    return (
      <>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <img src='/patch.png' alt='patch.png' height='80px'></img>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Iris Space Electronic Warfare Sandbox
              </Typography>
              {auth &&
                <IconButton
                  size="large"
                  aria-labels="logout"
                  onClick={handleLogout}
                  color="inherit"
                  >
                    <Logout />
                </IconButton>
              }
            </Toolbar>
          </AppBar>
        </Box>
      </>
    );
  }
  