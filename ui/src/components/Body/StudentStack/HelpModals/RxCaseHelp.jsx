import React from 'react';
import { Box, Modal, Typography } from '@mui/material';
import { sxModal } from '../../../styles/sxModal';
import PropTypes from 'prop-types';
import { AstroTheme } from '../../../../themes/AstroTheme';

const RxCaseHelp = ({ modalState, setModalState }) => {
  return (
    <Modal open={modalState} onClose={() => setModalState(false)}>
      <Box sx={{ ...sxModal, ...{ color: AstroTheme.palette.tertiary.light4 } }}>
        <Typography align='center' m={1} variant='h4'>
          Receiver Case
        </Typography>
        <Typography m={1} variant='h5'>
          Description
        </Typography>
        <Typography ml={1} mr={1} variant='body1'>
          There are 4 receiver cases each containing 4 receiver modems (16 total). The signal is converted to L-Band and
          then if the settings are corrected it will be displayed on the monitor.
        </Typography>
        <Typography m={1} variant='h5'>
          Antenna
        </Typography>
        <Typography ml={1} mr={1} variant='body1'>
          Select which antenna the receiver should be connected to.
        </Typography>
        <Typography m={1} variant='h5'>
          Frequency
        </Typography>
        <Typography ml={1} mr={1} variant='body1'>
          Set the frequency the receiver is centered on.
        </Typography>
        <Typography m={1} variant='h5'>
          Bandwidth
        </Typography>
        <Typography ml={1} mr={1} variant='body1'>
          {`Select the bandwidth (how wide the signal is). If the bandwidth is too small you won't see the whole signal, but if it is too big you will have too much noise mixed into the signal.`}
        </Typography>
        <Typography m={1} variant='h5'>
          Modulation
        </Typography>
        <Typography ml={1} mr={1} variant='body1'>
          Set how the signal is modulated. These four options are common methods for encoding the data into a signal.
          This is typically provided by the company or intel.
        </Typography>
        <Typography m={1} variant='h5'>
          Forward Error Correction
        </Typography>
        <Typography ml={1} mr={1} variant='body1'>
          Set the error correction scheme for the signal. This is typically provided by the company or intel.
        </Typography>
      </Box>
    </Modal>
  );
};

RxCaseHelp.propTypes = {
  modalState: PropTypes.bool.isRequired,
  setModalState: PropTypes.func.isRequired,
};

export default RxCaseHelp;
