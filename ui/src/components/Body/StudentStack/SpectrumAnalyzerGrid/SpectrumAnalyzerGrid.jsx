import { Grid } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { SpectrumAnalyzerBox, AnalyzerControl } from '../../../';
import config from '../../../../config';
import { useUpdateSewApp } from '../../../../context';

export const SpectrumAnalyzerGrid = () => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [currentSpecAnalyzer, setCurrentSpecAnalyzer] = useState(null);
  const updateSewAppContext = useUpdateSewApp();

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

  const ApiUrl = config[process.env.REACT_APP_NODE_ENV || 'development'].apiUrl;
  useEffect(() => {
    fetch(`${ApiUrl}/data/signal`).then(res => {
      res.json().then(data => {
        window.sewApp.environment.setSignals(data);
        updateSewAppContext();
      });
    });
  }, []);

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
