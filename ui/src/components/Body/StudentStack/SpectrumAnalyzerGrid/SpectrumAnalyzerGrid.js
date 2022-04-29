import { Grid } from '@mui/material';
import React, { useState } from 'react';
import SpectrumAnalyzerBox from './SpectrumAnalyzer/SpectrumAnalyzerBox';
import AnalyzerControl from './AnalyzerControl/AnalyzerControl';

// MUI Grid: https://mui.com/material-ui/react-grid/

const SpectrumAnalyzerGrid = () => {
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

export default SpectrumAnalyzerGrid;
