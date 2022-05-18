import React, { useEffect } from 'react';
import { ARTGrid, SpectrumAnalyzerGrid, TeamInfo } from '../../';
import { Grid } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUpdateSewApp } from '../../../context';

export const StudentStack = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const updateSewAppContext = useUpdateSewApp();

  useEffect(() => {
    window.sewApp.init();
    updateSewAppContext();
    document.addEventListener('contextmenu', event => event.preventDefault());
  }, []);

  // Basic check that user is logged in
  useEffect(() => {
    if (!state || state?.isAuthenticated !== true) navigate('/login');
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
