import React, { useState, useEffect } from 'react';
import { RuxContainer } from '@astrouxds/react'
import './TeamInfo.css';
import { Typography } from '@mui/material';
//import { AstroTheme } from '../../../../themes/AstroTheme';
import { teams } from '../../../../constants';
import { githubCheck } from '../../../../lib/github-check';
import { useSewApp } from '../../../../context/sewAppContext';
import { useLocation } from 'react-router-dom';

export const TeamInfo = () => {
  const sewAppCtx = useSewApp();
  const [servers, setServers] = useState([]);
  const { state } = useLocation();

  useEffect(() => {
    if (!githubCheck()) {
      const { data: _servers } = fetch('data/server');
      setServers(_servers);
    } else {
      fetch('./data/server.json').then((res) =>
        res.json().then((data) => {
          setServers(data);
        })
      );
    }
  }, []);

  return (
    <RuxContainer>
      {state?.isAuthenticated ? (
        <>
          <div>
            <Typography variant='h6'>Team: {teams[sewAppCtx.user?.team_id - 1].name}</Typography>
          </div>
          <div>
            <Typography variant='h6'>
              Server: {servers ? servers[sewAppCtx.user.server_id - 1]?.name : 'Disconnected'}
            </Typography>
          </div>
        </>
      ) : null}
    </RuxContainer>
  );
};
