/* eslint-disable react/prop-types */ // TODO: upgrade to latest eslint tooling

//import { Paper } from '@mui/material';
import React from 'react';
import "./body.css";
//import { RuxContainer } from '@astrouxds/react'
// Contains the main part of the app

export const Body = props => {
  // const sxBody = {
  //   margin: '0 auto',
  //   display: 'flex',
  //   flexDirection: 'column',
  //   borderRadius: 0,
  //   height: '100%',
  //   width: '100%',
  //   flexGrow: 1,
  //   backgroundColor: theme.palette.tertiary.light3,
  // };
  // return <Paper sx={sxBody}>{props.children}</Paper>;
  return <div className="body">{props.children}</div>
};
