import React from 'react';
import { Box, Modal, Typography } from '@mui/material';
import { sxModal } from '../../../styles/sxModal';
import PropTypes from 'prop-types';
import { AstroTheme } from '../../../../themes/AstroTheme';

const SpecAHelp = ({ modalState, setModalState }) => {
  return (
    <Modal open={modalState} onClose={() => setModalState(false)}>
      <Box sx={{ ...sxModal, ...{ color: AstroTheme.palette.tertiary.light4 } }}>
        <Typography align='center' m={1} variant='h4'>
          Spectrum Analyzer
        </Typography>
        <Typography m={1} variant='h5'>
          Description
        </Typography>
        <Typography ml={1} mr={1} variant='body1'>
          The spectrum analyzer is used to view the analog signal on the EM spectrum. The higher the peak, the more
          power that is detected.
        </Typography>
        <Typography m={1} variant='h5'>
          Antenna
        </Typography>
        <Typography ml={1} mr={1} variant='body1'>
          Select which antenna the spectrum analyzer should be connected to.
        </Typography>
        <Typography m={1} variant='h5'>
          Config
        </Typography>
        <Typography ml={1} mr={1} variant='body1'>
          Opens the configuration menu. Use this to change the center frequency and span of the spectrum analyzer. The
          hold function will maintain the highest power in the spectrum analyzer until cleared.
        </Typography>
        <Typography m={1} variant='h5'>
          IF / RF
        </Typography>
        <Typography ml={1} mr={1} variant='body1'>
          Toggle between Intermediate Frequency and the Radio Frequency.
        </Typography>
        <Typography m={1} variant='h5'>
          Pause
        </Typography>
        <Typography ml={1} mr={1} variant='body1'>
          Pause the spectrum analyzer.
        </Typography>
      </Box>
    </Modal>
  );
};

SpecAHelp.propTypes = {
  modalState: PropTypes.bool.isRequired,
  setModalState: PropTypes.func.isRequired,
};

export default SpecAHelp;
