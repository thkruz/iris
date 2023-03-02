import React, { useState } from 'react';
import { RuxContainer, RuxIcon, RuxTooltip } from '@astrouxds/react'
import PropTypes from 'prop-types';
import { Grid } from '@mui/material';
import { EquipmentCaseId } from './EquipmentCaseId';
import { InstructionsIcon } from '../HelpModals/InstructionsIcon';
import './equipmentCase.css';

export const EquipmentCase = ({ children, helpTitle, helpComponent, unit, icon }) => {
  const [helpState, setHelpState] = useState(false);

  return (
    <>
      {helpComponent({ modalState: helpState, setModalState: setHelpState })}
      <RuxContainer className="container_equipment-case">
        <Grid container>
          <Grid item mr={1} width={30}>
            <EquipmentCaseId unit={unit} icon={icon} />
          </Grid>
          <Grid item xs={true}>
            {children}
          </Grid>
          <Grid item xs={'auto'} ml={0}>
            <RuxTooltip message={helpTitle} placement='top'>
              <RuxIcon icon='help-outline'
              size='24px'
              className='helpIcon'
              style={{ paddingLeft: '8px' }}
                onClick={() => {
                  setHelpState(true);
                }}>
                <InstructionsIcon />
              </RuxIcon>
            </RuxTooltip>
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
