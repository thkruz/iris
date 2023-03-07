import React from 'react';
import PropTypes from 'prop-types';
import { RuxDialog } from '@astrouxds/react';

const SpecAHelp = ({ modalState, setModalState }) => {
  return (
    <RuxDialog clickToClose header="Spectrum Analyzer" open={modalState}  onRuxdialogclosed={() => setModalState(false)}>
        <h2>Description</h2>
        <p>The spectrum analyzer is used to view the analog signal on the EM spectrum. The higher the peak, the more
          power that is detected.</p>
        <h2>Antenna</h2>
        <p>Select which antenna the spectrum analyzer should be connected to.</p>
        <h2>Config</h2>
        <p>Opens the configuration menu. Use this to change the center frequency and span of the spectrum analyzer. The
          hold function will maintain the highest power in the spectrum analyzer until cleared.</p>
        <h2>IF / RF</h2>
        <p>Toggle between Intermediate Frequency and the Radio Frequency.</p>
        <h2>Pause</h2>
        <p>Pause the spectrum analyzer.</p>
    </RuxDialog>
  );
};

SpecAHelp.propTypes = {
  modalState: PropTypes.bool.isRequired,
  setModalState: PropTypes.func.isRequired,
};

export default SpecAHelp;
