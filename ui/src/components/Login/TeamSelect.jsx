import React from 'react';
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
      <Grid item xs={4}>
        <label htmlFor='team'>Team</label>
      </Grid>
      <Grid item xs={8}>
        <select
          name='team'
          type='string'
          value={teams[sewAppCtx.user.team_id - 1].id}
          onChange={e => handleTeamChange(parseInt(e.target.value))}>
          {teams.map((x, index) => (
            <option key={index} value={x.id}>
              {x.name}
            </option>
          ))}
        </select>
      </Grid>
    </Grid>
  );
};
