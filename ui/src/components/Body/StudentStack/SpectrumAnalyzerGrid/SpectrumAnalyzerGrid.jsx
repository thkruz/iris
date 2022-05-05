import { Grid } from '@mui/material';
import React, { useEffect, useState } from 'react';
import SpectrumAnalyzerBox from './SpectrumAnalyzer/SpectrumAnalyzerBox';
import AnalyzerControl from './AnalyzerControl/AnalyzerControl';
import config from '../../../../config';

// MUI Grid: https://mui.com/material-ui/react-grid/

const SpectrumAnalyzerGrid = () => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [currentSpecAnalyzer, setCurrentSpecAnalyzer] = useState(null);

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

  const ApiUrl = config[process.env.REACT_APP_NODE_ENV || 'development'].apiUrl;

  useEffect(() => {
    fetch(`${ApiUrl}/data/signal`).then(res => {
      res.json().then(data => {
        window.sewApp.environment.setSignals(data);
        for (let i = 1; i <= 4; i++) {
          const specA = window.sewApp.getSpectrumAnalyzer(i);
          data.forEach(signal => {
            specA.signals.push({
              freq: signal.frequency * 1e6,
              amp: signal.power,
              bw: signal.bandwidth * 1e6,
              targetId: signal.target_id,
            });
          });
          specA.signals.push({ freq: 425e6, amp: -108, bw: 3e6 });
          specA.signals.push({ freq: 435e6, amp: -80, bw: 10e6 });
          specA.signals.push({ freq: 445e6, amp: -60, bw: 5e6 });
          specA.signals.push({ freq: 448e6, amp: -60, bw: 1e6 });
          specA.signals.push({ freq: 422e6, amp: -60, bw: 0.5e6 });
          specA.signals.push({ freq: 423e6, amp: -60, bw: 1e6 });
        }
      });
    });
  }, []);

  return (
    <>
      <Grid container item spacing={3} xs={12}>
        <Grid item xs={6} s={6} md={6} lg={6} xl={3}>
          {<SpectrumAnalyzerBox handleConfigClick={handleConfigClick} canvasId={'specA1'} />}
        </Grid>
        <Grid item xs={6} s={6} md={6} lg={6} xl={3}>
          {<SpectrumAnalyzerBox handleConfigClick={handleConfigClick} canvasId={'specA2'} />}
        </Grid>
        <Grid item xs={6} s={6} md={6} lg={6} xl={3}>
          {<SpectrumAnalyzerBox handleConfigClick={handleConfigClick} canvasId={'specA3'} />}
        </Grid>
        <Grid item xs={6} s={6} md={6} lg={6} xl={3}>
          {<SpectrumAnalyzerBox handleConfigClick={handleConfigClick} canvasId={'specA4'} />}
        </Grid>
      </Grid>
      {isConfigOpen ? (
        <AnalyzerControl currentSpecAnalyzer={currentSpecAnalyzer} handleBackgroundClick={handleBackgroundClick} />
      ) : null}
    </>
  );
};

export default SpectrumAnalyzerGrid;
