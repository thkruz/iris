import React from 'react';
import PropTypes from 'prop-types';
import { RuxDialog } from '@astrouxds/react';

const RxCaseHelp = ({ modalState, setModalState }) => {
  return (
    <RuxDialog header="Receiver Case" clickToClose open={modalState} onRuxdialogclosed={() => setModalState(false)}>
      <h2>Description</h2>
      <p>There are 4 receiver cases each containing 4 receiver modems (16 total). The signal is converted to L-Band and  then if the settings are corrected it will be displayed on the monitor.</p>
      <h2>Antenna</h2>
      <p>Select which antenna the receiver should be connected to.</p>
      <h2>Frequency</h2>
      <p>Set the frequency the receiver is centered on.</p>
      <h2>Bandwidth</h2>
      <p>{`Select the bandwidth (how wide the signal is). If the bandwidth is too small you won't see the whole signal, but if it is too big you will have too much noise mixed into the signal.`}</p>
      <h2>Modulation</h2>
      <p>Set how the signal is modulated. These four options are common methods for encoding the data into a signal.  This is typically provided by the company or intel.</p>
      <h2>Forward Error Correction</h2>
      <p>Set the error correction scheme for the signal. This is typically provided by the company or intel.</p>
    </RuxDialog>
  );
};

RxCaseHelp.propTypes = {
  modalState: PropTypes.bool.isRequired,
  setModalState: PropTypes.func.isRequired,
};

export default RxCaseHelp;
