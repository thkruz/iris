import { Grid } from '@mui/material';
import React, { useState } from 'react';
import { RuxDialog } from '@astrouxds/react'
import { SpectrumAnalyzerBox, AnalyzerControl } from '../../../';

export const SpectrumAnalyzerGrid = () => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [currentSpecAnalyzer, setCurrentSpecAnalyzer] = useState(null);

  const handleConfigClick = (specAnalyzer) => {
    setCurrentSpecAnalyzer(specAnalyzer);
    setIsConfigOpen(true);
  };

  const handleRfClick = (specAnalyzer) => {
    setCurrentSpecAnalyzer(specAnalyzer);
  };

  const handlePauseClicked = (specAnalyzer) => {
    setCurrentSpecAnalyzer(specAnalyzer);
  };

  const handleBackgroundClick = (e) => {
    // Don't hide the screen unless the background was clicked
    // NOTE: Any click action triggers this event
    if (e.target.id === 'analyzerControlModalOverlay') {
      setIsConfigOpen(false);
    }
  };

  return (
    <>
      <Grid container item spacing={2} xs={12} lg={6}>
        {[1, 2].map((unit) => (
          <Grid key={unit} item xs={true} minWidth={300}>
            {
              <SpectrumAnalyzerBox
                handleConfigClick={handleConfigClick}
                handleRfClick={handleRfClick}
                handlePauseClicked={handlePauseClicked}
                canvasId={`specA${unit}`}
              />
            }
          </Grid>
        ))}
      </Grid>
      <Grid container item spacing={2} xs={12} lg={6}>
        {[3, 4].map((unit) => (
          <Grid key={unit} item xs={true} minWidth={300}>
            {
              <SpectrumAnalyzerBox
                handleConfigClick={handleConfigClick}
                handleRfClick={handleRfClick}
                handlePauseClicked={handlePauseClicked}
                canvasId={`specA${unit}`}
              />
            }
          </Grid>
        ))}
      </Grid>
      {isConfigOpen ? (
        <RuxDialog open={isConfigOpen} clickToClose onRuxdialogclosed={() => setIsConfigOpen(false)} header='Spectrum Analyzer Config' class="analyzer-config">
          <AnalyzerControl currentSpecAnalyzer={currentSpecAnalyzer} handleBackgroundClick={handleBackgroundClick} />
        </RuxDialog>
      ) : null}
    </>
  );
};
