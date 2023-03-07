import React from 'react';
import PropTypes from 'prop-types';
import { RuxDialog } from '@astrouxds/react';

const AntennaHelp = ({ modalState, setModalState }) => {
  return (
    <RuxDialog header="Antenna" clickToClose open={modalState} onRuxdialogclosed={() => setModalState(false)}>
        <h2>Description</h2>
        <p>You have two antennas to use with your transmitters.</p>
        <h2>Pathway Switch</h2>
        <p>This switch allows you to select between loopback and the antenna.</p>
        <h2>High Powered Amplifier</h2>
        <p>In order to transmit, the antenna must be connected to a high powered amplifier.</p>
        <h2>Target</h2>
        <p>This is the satellite your antenna is pointed at.</p>
        <h2>Band</h2>
        <p>In this simulation you can only use C or Ku bands currently. Depending on which band you choose will determine
          the upconversion and downconversion frequencies.</p>
        <h2>Offset</h2>
        <p>{`When using loopback, the offset will be applied to simulate the satellite's internal offset. If you are using the antenna then the offset will be ignored.`}</p>
        <h2>Auto-Track</h2>
        <p>You need to enable the antenna and then enable the auto-track feature to keep locked on to the satellites.</p>
    </RuxDialog>
  );
};

AntennaHelp.propTypes = {
  modalState: PropTypes.bool.isRequired,
  setModalState: PropTypes.func.isRequired,
};

export default AntennaHelp;
