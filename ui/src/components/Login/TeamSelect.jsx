import React from 'react';
import { RuxSelect, RuxOption } from '@astrouxds/react'
import { Grid } from '@mui/material';
import { teams } from '../../constants';
import { useSewApp } from '../../context/sewAppContext';

export const TeamSelect = () => {
  const sewAppCtx = useSewApp();

  const handleTeamChange = value => {
    console.log(value);
    sewAppCtx.updateUser({ ...sewAppCtx.user, team_id: value });
  };

  return (
    <Grid container item xs={12}>
      <Grid item xs={12}>
        <RuxSelect
          name='team'
          type='string'
          label='Team'
          value={teams[sewAppCtx.user.team_id - 1].id}
          onChange={e => handleTeamChange(parseInt(e.target.value))}>
          {teams.map((x, index) => (
            <RuxOption key={index} value={x.id} label={x.name}>
              {x.name}
            </RuxOption>
          ))}
        </RuxSelect>
      </Grid>
    </Grid>
  );
};
