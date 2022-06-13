import React, { useEffect } from 'react';
import { ARTGrid, SpectrumAnalyzerGrid, TeamInfo } from '../../';
import { Grid } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSewApp } from '../../../context/sewAppContext';

export const StudentStack = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const sewAppCtx = useSewApp();

  useEffect(() => {
    window.sewApp.init();
    sewAppCtx.updateSewApp();
    document.addEventListener('contextmenu', event => event.preventDefault());
  }, []);

  // Basic check that user is logged in
  useEffect(() => {
    if (!state || state?.isAuthenticated !== true) navigate('/login');
  }, [state, navigate]);

  return (
    <>
      <TeamInfo />
      <Grid container spacing={2} paddingTop={2} paddingBottom={2} paddingLeft={2} paddingRight={2}>
        <SpectrumAnalyzerGrid />
        <ARTGrid />
      </Grid>
    </>
  );
};
