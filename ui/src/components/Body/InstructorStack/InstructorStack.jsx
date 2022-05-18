import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Injects, Timeline, SpectrumOverview } from '../..';

export const InstructorStack = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Basic check that user is logged in
  useEffect(() => {
    if (!state || state?.isAuthenticated !== true) navigate('/login');
  }, [state, navigate]);

  return (
    <>
      <Injects />
      <Timeline />
      <SpectrumOverview />
    </>
  );
};
