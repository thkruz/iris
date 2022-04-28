/* eslint-disable react/prop-types */

import { Box } from '@mui/material';
import { SpectrumAnalyzer } from './SpectrumAnalyzer.js';
import React, { useLayoutEffect } from 'react';

// MUI Stack: https://mui.com/material-ui/react-stack/

let specA = null;

const SpectrumAnalyzerBoxStyle = {
  backgroundColor: '#005a8f',
  textAlign: 'center',
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  borderRadius: '10px',
  boxShadow: '0px 0px 10px rgba(0,0,0,0.5)',
  border: '1px solid #005a8f',
  overflow: 'hidden',
  position: 'relative',
  zIndex: '1',
};

const SpectrumAnalyzerBox = props => {
  useLayoutEffect(() => {
    console.log('resizeStart');
  }, []);

  useLayoutEffect(() => {
    const canvasDom = document.getElementById(props.canvasId);
    canvasDom.width = canvasDom.parentElement.offsetWidth;
    canvasDom.height = canvasDom.parentElement.offsetWidth;

    specA = new SpectrumAnalyzer(canvasDom, {
      refreshRate: 15, // per second
      noiseFloor: -110,
      isShowSignals: false,
    });

    switch (props.canvasId) {
      case 'specA1':
        specA.signals.push({ freq: 425e6, amp: -108, bw: 3e6 });
        specA.signals.push({ freq: 435e6, amp: -22, bw: 10e6 });
        specA.signals.push({ freq: 445e6, amp: -60, bw: 5e6 });
        break;
      case 'specA2':
        specA.signals.push({ freq: 448e6, amp: -60, bw: 1e6 });
        specA.signals.push({ freq: 422e6, amp: -60, bw: 0.5e6 });
        specA.signals.push({ freq: 423e6, amp: -60, bw: 1e6 });
        break;
      case 'specA3':
        specA.signals.push({ freq: 449e6, amp: -60, bw: 1e6 });
        specA.signals.push({ freq: 449e6, amp: -60, bw: 1e6 });
        specA.signals.push({ freq: 449e6, amp: -60, bw: 1e6 });
        break;
      case 'specA4':
        specA.signals.push({ freq: 449e6, amp: -60, bw: 1e6 });
        specA.signals.push({ freq: 449e6, amp: -60, bw: 1e6 });
        specA.signals.push({ freq: 449e6, amp: -60, bw: 1e6 });
        break;
    }
    specA.start();
  }, []);

  // setSpectrumAnalyzer(specA);
  return (
    <Box sx={SpectrumAnalyzerBoxStyle}>
      <canvas id={props.canvasId}></canvas>
    </Box>
  );
};

export default SpectrumAnalyzerBox;
