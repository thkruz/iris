import React from 'react';
import { RuxTooltip } from '@astrouxds/react'
import { Grid } from '@mui/material';
import { TxModem } from '../../../..';
import { EquipmentCase } from '../EquipmentCase';
import PodcastsIcon from '@mui/icons-material/Podcasts';
import { AstroTheme } from '../../../../../themes/AstroTheme';
import { useSewApp } from '../../../../../context/sewAppContext';
import { PropTypes } from 'prop-types';
import TxCaseHelp from './../../HelpModals/TxCaseHelp';

export const TxCase = ({ unit }) => {
  const sewAppCtx = useSewApp();
  const isTransmitting =
    sewAppCtx.tx
      .filter(
        (tx) =>
          tx.id === (unit - 1) * 4 + 1 ||
          tx.id === (unit - 1) * 4 + 2 ||
          tx.id === (unit - 1) * 4 + 3 ||
          tx.id === (unit - 1) * 4 + 4
      )
      .filter((tx) => tx.transmitting).length > 0;

  return (
    <Grid item xs={true} minWidth={500} key={unit}>
      <EquipmentCase
        helpTitle='Transmit Modem Help'
        helpComponent={TxCaseHelp}
        unit={unit}
        icon={
          <RuxTooltip message={isTransmitting ? 'Transmitting' : 'Not Transmitting'}>
            <PodcastsIcon
              sx={{ color: isTransmitting ? AstroTheme.palette.normal.main : AstroTheme.palette.disabled.main }}
            />
          </RuxTooltip>
        }>
        <TxModem unit={unit} />
      </EquipmentCase>
    </Grid>
  );
};
TxCase.propTypes = {
  unit: PropTypes.number.isRequired,
  isTransmitting: PropTypes.bool,
};
