import { Grid } from '@mui/material';
import React, { useState } from 'react';
import {SpectrumAnalyzerBox, AnalyzerControl} from '../../../';

export const SpectrumAnalyzerGrid = () => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [currentSpecAnalyzer, setCurrentSpecAnalyzer] = useState(null);

  const handleConfigClick = specAnalyzer => {
    setCurrentSpecAnalyzer(specAnalyzer);
    setIsConfigOpen(true);
  };

  const handleBackgroundClick = e => {
    console.log(e.target);
    if (e.target.id === 'analyzerControlModalOverlay') {
      setIsConfigOpen(false);
    }
  };

  return (
    <>
      <Grid container item spacing={1} xs={12}>
        <Grid item xs={3}>
          <SpectrumAnalyzerBox handleConfigClick={handleConfigClick} canvasId={'specA1'} />
        </Grid>
        <Grid item xs={3}>
          <SpectrumAnalyzerBox handleConfigClick={handleConfigClick} canvasId={'specA2'} />
        </Grid>
        <Grid item xs={3}>
          <SpectrumAnalyzerBox handleConfigClick={handleConfigClick} canvasId={'specA3'} />
        </Grid>
        <Grid item xs={3}>
          <SpectrumAnalyzerBox handleConfigClick={handleConfigClick} canvasId={'specA4'} />
        </Grid>
      </Grid>
      {isConfigOpen ? (
        <AnalyzerControl currentSpecAnalyzer={currentSpecAnalyzer} handleBackgroundClick={handleBackgroundClick} />
      ) : null}
    </>
  );
};