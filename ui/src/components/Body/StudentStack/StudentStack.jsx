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
    if (!state || state?.isAuthenticated !== true) navigate(process.env.PUBLIC_URL + '/login');
  }, [state, navigate]);

  return (
    <>
      <TeamInfo />
      <Grid container spacing={1} paddingTop={2} paddingBottom={2} paddingLeft={6} paddingRight={6}>
        <SpectrumAnalyzerGrid />
        <ARTGrid />
      </Grid>
    </>
  );
};
