import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Grid, IconButton, Tooltip } from '@mui/material';
import { EquipmentCaseId } from './EquipmentCaseId';
import { InstructionsIcon } from '../HelpModals/InstructionsIcon';
import { sxEquipmentCase } from '../../../styles';

export const EquipmentCase = ({ children, helpTitle, helpComponent, unit, icon }) => {
  const [helpState, setHelpState] = useState(false);

  return (
    <>
      {helpComponent({ modalState: helpState, setModalState: setHelpState })}
      <Box sx={sxEquipmentCase}>
        <Grid container>
          <Grid item width={30}>
            <EquipmentCaseId unit={unit} icon={icon} />
          </Grid>
          <Grid item xs={true}>
            {children}
          </Grid>
          <Grid item xs={'auto'} ml={0}>
            <Tooltip title={helpTitle} placement='top'>
              <IconButton
                onClick={() => {
                  setHelpState(true);
                }}>
                <InstructionsIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

EquipmentCase.propTypes = {
  children: PropTypes.node.isRequired,
  helpTitle: PropTypes.string.isRequired,
  helpComponent: PropTypes.func.isRequired,
  unit: PropTypes.number.isRequired,
  icon: PropTypes.node,
};
