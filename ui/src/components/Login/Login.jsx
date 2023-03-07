import React from 'react';
import { RuxContainer, RuxCard } from '@astrouxds/react'
import Box from '@mui/material/Box';
import { Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ServerSelect } from './ServerSelect';
import { TeamSelect } from './TeamSelect';
import { JoinButton } from './JoinButton';
import "./login.css";

export const Login = () => {
  const navigate = useNavigate();

  const handleSubmit = () => {
    navigate('/student', { state: { isAuthenticated: true } });
  };

  return (
      <RuxContainer class="login-container">
        <RuxCard style={{ width: 'fitContent', margin: 'auto', }}>
          <Box
            style={{ display: 'flex', justifyContent: 'center', }}
            component='form'
            onSubmit={handleSubmit}
            novalidate
            autocomplete='off'>
            <Grid container spacing={1} p={2} width={300}>
              <TeamSelect />
              <ServerSelect />
              <JoinButton />
            </Grid>
          </Box>
        </RuxCard>
      </RuxContainer>
  );
};

export default Login;
