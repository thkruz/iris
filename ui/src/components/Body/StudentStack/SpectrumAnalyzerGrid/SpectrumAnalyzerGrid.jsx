import { Grid } from '@mui/material';
import React, { useEffect, useState } from 'react';
import SpectrumAnalyzerBox from './SpectrumAnalyzer/SpectrumAnalyzerBox';
import AnalyzerControl from './AnalyzerControl/AnalyzerControl';

// MUI Grid: https://mui.com/material-ui/react-grid/

const SpectrumAnalyzerGrid = () => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [currentSpecAnalyzer, setCurrentSpecAnalyzer] = useState(null);
  const [signals, setSignals] = useState(null);

  const handleConfigClick = specAnalyzer => {
    setCurrentSpecAnalyzer(specAnalyzer);
    setIsConfigOpen(true);
  };

  const handleBackgroundClick = e => {
    // Don't hide the screen unless the background was clicked
    // NOTE: Any click action triggers this event
    if (e.target.id === 'analyzerControlModalOverlay') {
      setIsConfigOpen(false);
    }
  };

  useEffect(() => {
    fetch('http://localhost:8082/data/signal').then(res => {
      res.json().then(data => {
        console.log(data);
        setSignals(data);
      });
    });
  }, []);

  return (
    <>
      <Grid container item spacing={1} xs={12}>
        <Grid item xs={3}>
          <SpectrumAnalyzerBox handleConfigClick={handleConfigClick} canvasId={'specA1'} signals={signals} />
        </Grid>
        <Grid item xs={3}>
          <SpectrumAnalyzerBox handleConfigClick={handleConfigClick} canvasId={'specA2'} signals={signals} />
        </Grid>
        <Grid item xs={3}>
          <SpectrumAnalyzerBox handleConfigClick={handleConfigClick} canvasId={'specA3'} signals={signals} />
        </Grid>
        <Grid item xs={3}>
          <SpectrumAnalyzerBox handleConfigClick={handleConfigClick} canvasId={'specA4'} signals={signals} />
        </Grid>
      </Grid>
      {isConfigOpen ? (
        <AnalyzerControl currentSpecAnalyzer={currentSpecAnalyzer} handleBackgroundClick={handleBackgroundClick} />
      ) : null}
    </>
  );
};

export default SpectrumAnalyzerGrid;
