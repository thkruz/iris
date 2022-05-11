/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Typography } from '@mui/material';
import './TxModem.css';
import { AstroTheme } from '../../../../../../themes/AstroTheme';
import { useTx, useUpdateTx } from '../../../../../../context';
import { useAntenna } from './../../../../../../context/antennaContext';

export const TxModem = ({ unit }) => {
  const txData = useTx();
  const updateTxData = useUpdateTx();

  //TODO: modem buttons, update state, video,
  const theme = AstroTheme;
  const [activeModem, setActiveModem] = useState(0);

  // Styles
  const sxCase = {
    flexGrow: 1,
    backgroundColor: theme.palette.primary.main,
    borderRadius: '10px',
    border: '1px solid black',
    display: 'grid',
    gridTemplateColumns: '30px 1fr 4fr 3fr 5fr',
    justifyContent: 'space-between',
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
  };
  const sxCaseId = {
    color: 'white',
    margin: '8px',
    textAlign: 'center',
  };
  const sxModemButtonBox = {
    backgroundColor: theme.palette.primary.light,
    borderRadius: '5px',
    boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.75)',
  };
  // const sxModemButton = {
  //   backgroundColor: theme.palette.primary.light,
  //   boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.75)',
  //   color: 'black',
  //   margin: '8px',
  //   cursor: 'pointer',
  // };
  // const sxModemButtonActive = {
  //   backgroundColor: theme.palette.primary.dark,
  //   boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.75)',
  //   color: 'white',
  //   width: '1em',
  //   margin: '8px',
  //   outline: 'none',
  // };
  // const sxModemButtonLive = {
  //   backgroundColor: theme.palette.primary.light,
  //   boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.75)',
  //   color: 'black',
  //   margin: '8px',
  //   cursor: 'pointer',
  // };
  const sxValues = {
    fontWeight: 'bold',
    textDecoration: 'underline',
  };
  const sxInputBox = {
    backgroundColor: theme.palette.primary.main,
    margin: '8px',
    borderRadius: '4px',
    display: 'grid',
    flexDirection: 'column',
  };
  const sxInputRow = {
    display: 'grid',
    gridTemplateColumns: '80px 80px 80px',
    textAlign: 'left',
    margin: '2px',
  };
  const sxInputApply = {
    backgroundColor: theme.palette.primary.light,
    boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.75)',
    color: 'black',
    margin: '8px',
    cursor: 'pointer',
  };
  const sxTransmit = {
    cursor: 'pointer',
    margin: '8px',
    backgroundColor: txData[(unit - 1) * 4 + activeModem].transmitting ? 'red' : theme.palette.primary.dark,
    color: txData[(unit - 1) * 4 + activeModem].transmitting ? 'black' : 'white',
    boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.75)',
    border: '1px solid red',
  };

  // Modem Case Id
  const sidebar = [];
  ['T', 'X'].forEach((x, index) => {
    sidebar.push(
      <Typography key={index} sx={{ color: 'black' }}>
        {x}
      </Typography>
    );
  });
  const TxCaseId = () => (
    <Box sx={sxCaseId}>
      {sidebar}
      <br></br>
      <Typography>{unit}</Typography>
    </Box>
  );
  // Modem selector buttons
  const TxModemButtonBox = () => (
    <Box sx={sxModemButtonBox}>
      {txData.map((x, index) => {
        if (x.unit == unit) return <TxModemButton key={index} modem={x.modem} transmitting={x.transmitting} />;
      })}
    </Box>
  );
  const TxModemButton = ({ modem, transmitting }) => (
    <Button
      sx={{
        backgroundColor: modem - 1 == activeModem ? theme.palette.primary.dark : theme.palette.primary.light,
        boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.75)',
        color: 'white',
        width: '1em',
        margin: '8px',
        outline: 'none',
        border: `1px solid ${transmitting ? 'red' : 'rgba(0,0,0,0)'}`,
      }}
      onClick={e => {
        setActiveModem(parseInt(e.target.innerText) - 1);
      }}>
      {modem}
    </Button>
  );
  TxModemButton.propTypes = { modem: PropTypes.number };

  // Modem User Inputs
  const TxModemInput = () => {
    const currentRow = (unit - 1) * 4 + activeModem;
    const [inputData, setInputData] = useState(txData[currentRow]);

    const antenna = useAntenna();

    const handleInputChange = ({ param, val }) => {
      let tmpData = { ...inputData };
      tmpData[param] = val;
      setInputData(tmpData);
    };

    const handleApply = () => {
      let tmpData = [...txData];
      tmpData[currentRow] = inputData;
      updateTxData(tmpData);
    };

    const handleTransmit = () => {
      let tmpData = [...txData];
      tmpData[currentRow].transmitting = !tmpData[currentRow].transmitting;
      // Add a Target
      tmpData[currentRow].targetId = antenna[tmpData[currentRow].id_antenna - 1].id_target;
      updateTxData(tmpData);
    };
    
    return (
      <Box sx={sxInputBox}>
        <Box sx={sxInputRow}>
          <label htmlFor='Antenna'>Antenna</label>
          <select
            name='Antenna'
            value={inputData.id_antenna}
            onChange={e =>
              handleInputChange({
                param: 'id_antenna',
                val: parseInt(e.target.value),
              })
            }>
            <option value={1}>1</option>
            <option value={2}>2</option>
          </select>
          <Typography sx={sxValues}>{txData[currentRow].id_antenna}</Typography>
        </Box>
        <Box sx={sxInputRow}>
          <label htmlFor='frequency'>Frequency</label>
          <input
            name='frequency'
            type='text'
            value={inputData.frequency}
            onChange={e =>
              handleInputChange({
                param: 'frequency',
                val: parseInt(e.target.value),
              })
            }></input>
          <Typography sx={sxValues}>{txData[currentRow].frequency + ' MHz'}</Typography>
        </Box>
        <Box sx={sxInputRow}>
          <label htmlFor='bandwidth'>Bandwidth</label>
          <input
            name='bandwidth'
            type='text'
            value={inputData.bandwidth}
            onChange={e =>
              handleInputChange({
                param: 'bandwidth',
                val: parseInt(e.target.value),
              })
            }></input>
          <Typography sx={sxValues}>{txData[currentRow].bandwidth + ' MHz'}</Typography>
        </Box>
        <Box sx={sxInputRow}>
          <label htmlFor='power'>Power</label>
          <input
            name='power'
            type='string'
            value={inputData.power}
            onChange={e => handleInputChange({ param: 'power', val: parseInt(e.target.value) })}></input>
          <Typography sx={sxValues}>{`${txData[currentRow].power} dBm`}</Typography>
        </Box>
        <Box sx={sxInputRow}>
          <div></div>
          <Button sx={sxInputApply} onClick={e => handleApply(e)}>
            Apply
          </Button>
          <Button sx={sxTransmit} onClick={e => handleTransmit(e)}>
            TX
          </Button>
        </Box>
      </Box>
    );
  };

  return (
    <>
      <Box sx={sxCase}>
        <TxCaseId />
        <TxModemButtonBox />
        <TxModemInput />
      </Box>
    </>
  );
};

TxModem.propTypes = {
  unit: PropTypes.number,
};
