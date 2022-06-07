import { Grid } from '@mui/material';
import React, { useState } from 'react';
import { SpectrumAnalyzerBox, AnalyzerControl } from '../../../';

export const SpectrumAnalyzerGrid = () => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [currentSpecAnalyzer, setCurrentSpecAnalyzer] = useState(null);

  const handleConfigClick = specAnalyzer => {
    setCurrentSpecAnalyzer(specAnalyzer);
    setIsConfigOpen(true);
  };

  const handleRfClick = specAnalyzer => {
    setCurrentSpecAnalyzer(specAnalyzer);
  };

  const handlePauseClicked = specAnalyzer => {
    setCurrentSpecAnalyzer(specAnalyzer);
  };

  const handleBackgroundClick = e => {
    // Don't hide the screen unless the background was clicked
    // NOTE: Any click action triggers this event
    if (e.target.id === 'analyzerControlModalOverlay') {
      setIsConfigOpen(false);
    }
  };

  return (
    <>
      <Grid container item spacing={1.5} xs={12}>
        <Grid item xs={6} s={6} md={6} lg={6} xl={3}>
          {
            <SpectrumAnalyzerBox
              handleConfigClick={handleConfigClick}
              handleRfClick={handleRfClick}
              handlePauseClicked={handlePauseClicked}
              canvasId={'specA1'}
            />
          }
        </Grid>
        <Grid item xs={6} s={6} md={6} lg={6} xl={3}>
          {
            <SpectrumAnalyzerBox
              handleConfigClick={handleConfigClick}
              handleRfClick={handleRfClick}
              handlePauseClicked={handlePauseClicked}
              canvasId={'specA2'}
            />
          }
        </Grid>
        <Grid item xs={6} s={6} md={6} lg={6} xl={3}>
          {
            <SpectrumAnalyzerBox
              handleConfigClick={handleConfigClick}
              handleRfClick={handleRfClick}
              handlePauseClicked={handlePauseClicked}
              canvasId={'specA3'}
            />
          }
        </Grid>
        <Grid item xs={6} s={6} md={6} lg={6} xl={3}>
          {
            <SpectrumAnalyzerBox
              handleConfigClick={handleConfigClick}
              handleRfClick={handleRfClick}
              handlePauseClicked={handlePauseClicked}
              canvasId={'specA4'}
            />
          }
        </Grid>
      </Grid>
      {isConfigOpen ? (
        <AnalyzerControl currentSpecAnalyzer={currentSpecAnalyzer} handleBackgroundClick={handleBackgroundClick} />
      ) : null}
    </>
  );
};
