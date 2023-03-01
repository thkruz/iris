import React, { useState } from 'react';
import { RuxContainer, RuxIcon } from '@astrouxds/react'
import PropTypes from 'prop-types';
import { Grid, Tooltip } from '@mui/material';
import { EquipmentCaseId } from './EquipmentCaseId';
import { InstructionsIcon } from '../HelpModals/InstructionsIcon';
import { helpModalButton } from '../../../styles';

export const EquipmentCase = ({ children, helpTitle, helpComponent, unit, icon }) => {
  const [helpState, setHelpState] = useState(false);

  return (
    <>
      {helpComponent({ modalState: helpState, setModalState: setHelpState })}
      <RuxContainer>
        <Grid container>
          <Grid item width={30}>
            <EquipmentCaseId unit={unit} icon={icon} />
          </Grid>
          <Grid item xs={true}>
            {children}
          </Grid>
          <Grid item xs={'auto'} ml={0}>
            <Tooltip title={helpTitle} placement='top'>
              <RuxIcon icon='help-outline'
              size='small'
              style={helpModalButton}
                onClick={() => {
                  setHelpState(true);
                }}>
                <InstructionsIcon />
              </RuxIcon>
            </Tooltip>
          </Grid>
        </Grid>
      </RuxContainer>
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
