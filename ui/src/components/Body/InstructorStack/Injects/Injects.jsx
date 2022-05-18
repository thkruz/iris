import React, { useState, useEffect } from 'react';
import { Button, Grid } from '@mui/material';
import { AstroTheme } from '../../../../themes/AstroTheme';
import { Equipment } from '../../../';
import config from './../../../../config';

export const Injects = () => {
  const [sewApp, setSewApp] = useState(false);
  const theme = AstroTheme;
  const sxButton = {
    width: '100px',
    backgroundColor: theme.palette.primary.light,
    margin: '3px',
    color: 'black',
  };

  const loadData = () => {
    const ApiUrl = config[process.env.REACT_APP_NODE_ENV || 'development'].apiUrl;
    fetch(`${ApiUrl}/data/signal`).then(res => {
      res.json().then(data => {
        window.sewApp.environment.setSignals(data);
        setSewApp(window.sewApp);
      });
    });
    fetch(`${ApiUrl}/data/target`).then(res => {
      res.json().then(data => {
        window.sewApp.environment.setTargets(data);
        setSewApp(window.sewApp);
      });
    });
    fetch(`${ApiUrl}/data/team`).then(res => {
      res.json().then(data => {
        window.sewApp.environment.setTeams(data);
        setSewApp(window.sewApp);
      });
    });
    fetch(`${ApiUrl}/data/antenna`).then(res => {
      res.json().then(data => {
        window.sewApp.environment.setAntennas(data);
        setSewApp(window.sewApp);
      });
    });
    fetch(`${ApiUrl}/data/spec_a`).then(res => {
      res.json().then(data => {
        window.sewApp.environment.setSpecAs(data);
        setSewApp(window.sewApp);
      });
    });
    fetch(`${ApiUrl}/data/transmitter`).then(res => {
      res.json().then(data => {
        window.sewApp.environment.setTransmitters(data);
        setSewApp(window.sewApp);
      });
    });
    fetch(`${ApiUrl}/data/receiver`).then(res => {
      res.json().then(data => {
        window.sewApp.environment.setReceivers(data);
        setSewApp(window.sewApp);
      });
    });
  };

  useEffect(() => {
    if (sewApp) {
      console.log(sewApp);
    }
  }, [sewApp]);

  return (
    <Grid container>
      <Grid item xs={2}>
        <Button sx={sxButton} onClick={loadData}>
          Load
        </Button>
        <Button sx={sxButton}>Save</Button>
        <Button sx={sxButton}>Create</Button>
        <Button sx={sxButton}>Delete</Button>
        <Button sx={sxButton}>Schedule</Button>
      </Grid>
      <Grid item xs={10}>
        <Equipment sewApp={sewApp} />
      </Grid>
    </Grid>
  );
};
