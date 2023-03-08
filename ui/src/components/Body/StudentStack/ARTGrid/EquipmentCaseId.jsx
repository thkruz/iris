import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';

export const EquipmentCaseId = ({ unit, icon }) => {
  return (
    <Box textAlign={'center'}>
      {icon}
      <Typography style={{ color: 'var(--color-text-primary)', fontWeight: 'var(--font-weights-bold)', fontFamily: 'Nasa' }} fontSize={20}>
        {unit.toString()}
      </Typography>
    </Box>
  );
};

EquipmentCaseId.propTypes = {
  unit: PropTypes.number.isRequired,
  icon: PropTypes.node,
};
