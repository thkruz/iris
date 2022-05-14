import React, { useEffect } from 'react';
import { ARTGrid, SpectrumAnalyzerGrid, TeamInfo } from '../../';
import { Grid } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

export const StudentStack = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Basic check that user is logged in
  useEffect(() => {
    if (!state || state?.isAuthenticated !== true) navigate('/login');
  }, [state, navigate]);

  return (
    <>
      <TeamInfo />
      <Grid container spacing={3} padding={2}>
        <SpectrumAnalyzerGrid />
        <ARTGrid />
      </Grid>
    </>
  );
};
