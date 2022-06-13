import React from 'react';
import { Box, Modal, Typography } from '@mui/material';
import { sxModal } from '../../../styles/sxModal';
import PropTypes from 'prop-types';
import { AstroTheme } from '../../../../themes/AstroTheme';

const AntennaHelp = ({ modalState, setModalState }) => {
  return (
    <Modal open={modalState} onClose={() => setModalState(false)}>
      <Box sx={{ ...sxModal, ...{ color: AstroTheme.palette.tertiary.light4 } }}>
        <Typography align='center' m={1} variant='h4'>
          Antenna
        </Typography>
        <Typography m={1} variant='h5'>
          Description
        </Typography>
        <Typography ml={1} mr={1} variant='body1'>
          You have two antennas to use with your transmitters.
        </Typography>
        <Typography m={1} variant='h5'>
          Pathway Switch
        </Typography>
        <Typography ml={1} mr={1} variant='body1'>
          This switch allows you to select between loopback and the antenna.
        </Typography>
        <Typography m={1} variant='h5'>
          High Powered Amplifier
        </Typography>
        <Typography ml={1} mr={1} variant='body1'>
          In order to transmit, the antenna must be connected to a high powered amplifier.
        </Typography>
        <Typography m={1} variant='h5'>
          Target
        </Typography>
        <Typography ml={1} mr={1} variant='body1'>
          This is the satellite your antenna is pointed at.
        </Typography>
        <Typography m={1} variant='h5'>
          Band
        </Typography>
        <Typography ml={1} mr={1} variant='body1'>
          In this simulation you can only use C or Ku bands currently. Depending on which band you choose will determine
          the upconversion and downconversion frequencies.
        </Typography>
        <Typography m={1} variant='h5'>
          Offset
        </Typography>
        <Typography ml={1} mr={1} variant='body1'>
          {`When using loopback, the offset will be applied to simulate the satellite's internal offset. If you are using the antenna then the offset will be ignored.`}
        </Typography>
        <Typography m={1} variant='h5'>
          Auto-Track
        </Typography>
        <Typography ml={1} mr={1} variant='body1'>
          You need to enable the antenna and then enable the auto-track feature to keep locked on to the satellites.
        </Typography>
      </Box>
    </Modal>
  );
};

AntennaHelp.propTypes = {
  modalState: PropTypes.bool.isRequired,
  setModalState: PropTypes.func.isRequired,
};

export default AntennaHelp;
