import React from 'react';
import { Box, Modal, Typography } from '@mui/material';
import { sxModal } from '../../../styles/sxModal';
import PropTypes from 'prop-types';
import { AstroTheme } from '../../../../themes/AstroTheme';

const TxCaseHelp = ({ modalState, setModalState }) => {
  return (
    <Modal open={modalState} onClose={() => setModalState(false)}>
      <Box sx={{ ...sxModal, ...{ color: AstroTheme.palette.tertiary.light4 } }}>
        <Typography align='center' m={1} variant='h4'>
          Transmitter Case
        </Typography>
        <Typography m={1} variant='h5'>
          Description
        </Typography>
        <Typography ml={1} mr={1} variant='body1'>
          There are 4 transmitter cases each containing 4 transmitter modems (16 total). The signal is in L-Band and is
          upconverted at the antenna.
        </Typography>
        <Typography m={1} variant='h5'>
          Antenna
        </Typography>
        <Typography ml={1} mr={1} variant='body1'>
          Select which antenna the transmitter should be connected to.
        </Typography>
        <Typography m={1} variant='h5'>
          Frequency
        </Typography>
        <Typography ml={1} mr={1} variant='body1'>
          Set the frequency the transmitter is centered on.
        </Typography>
        <Typography m={1} variant='h5'>
          Bandwidth
        </Typography>
        <Typography ml={1} mr={1} variant='body1'>
          {`Select the bandwidth (how wide the signal is). The higher the bandwidth, the more power is used. If the bandwidth is too small you won't jam the whole signal, but if it is too big you may impact other signals.`}
        </Typography>
        <Typography m={1} variant='h5'>
          Power
        </Typography>
        <Typography ml={1} mr={1} variant='body1'>
          {`Set the power of the signal. The higher the power, the more power is used. If the power is too low you won't jam the signal.`}
        </Typography>
        <Typography m={1} variant='h5'>
          Power %
        </Typography>
        <Typography ml={1} mr={1} variant='body1'>
          {`This is the percentage of the power that is used. You can't use more power than you have!`}
        </Typography>
      </Box>
    </Modal>
  );
};

TxCaseHelp.propTypes = {
  modalState: PropTypes.bool.isRequired,
  setModalState: PropTypes.func.isRequired,
};

export default TxCaseHelp;
