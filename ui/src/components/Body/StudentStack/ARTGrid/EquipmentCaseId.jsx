import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';

export const EquipmentCaseId = ({ unit, icon }) => {
  return (
    <Box mt={2} textAlign={'center'}>
      {icon}
      <Typography sx={{ color: 'white', fontWeight: 700, fontFamily: 'Nasa' }} fontSize={20}>
        {unit.toString()}
      </Typography>
    </Box>
  );
};

EquipmentCaseId.propTypes = {
  unit: PropTypes.number.isRequired,
  icon: PropTypes.node,
};
