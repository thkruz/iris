/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Typography } from '@mui/material';
import './TxModem.css';
import { AstroTheme } from '../../../../../../themes/AstroTheme';
import { useSewApp } from '../../../../../../context/sewAppContext';
import { CRUDdataTable } from '../../../../../../crud';

export const TxModem = ({ unit }) => {
  const theme = AstroTheme;
  const sewAppCtx = useSewApp();
  const unitData = sewAppCtx.tx.filter(
    x => x.unit == unit && x.team_id == sewAppCtx.user.team_id && x.server_id == sewAppCtx.user.server_id
  );
  const powerBudget = 23886; // Decided by SEW team

  const [activeModem, setActiveModem] = useState(1);

  // Styles
  const sxCase = {
    flexGrow: 1,
    boxShadow: '0px 0px 5px rgba(0,0,0,0.5)',
    backgroundColor: AstroTheme.palette.tertiary.light2,
    border: '1px solid' + AstroTheme.palette.tertiary.light,
    borderRadius: '10px',
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
    boxShadow: '0px 0px 5px rgba(0,0,0,0.3)',
    backgroundColor: AstroTheme.palette.tertiary.light3,
    border: '1px solid' + AstroTheme.palette.tertiary.light,
    borderRadius: '5px',
  };
  const sxValues = {
    fontWeight: 'bold',
    textDecoration: 'underline',
  };
  const sxInputBox = {
    backgroundColor: theme.palette.tertiary.light2,
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
    backgroundColor: theme.palette.tertiary.light3,
    boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.75)',
    color: 'black',
    margin: '8px',
    cursor: 'pointer',
  };
  const sxTransmit = {
    cursor: 'pointer',
    margin: '8px',
    boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.5)',
    border: '1px solid red',
    backgroundColor: unitData.filter(x => x.modem_number == activeModem)[0].transmitting
      ? 'red'
      : theme.palette.tertiary.light3,
    color: unitData.filter(x => x.modem_number == activeModem)[0].transmitting ? 'white' : 'black',
    '&:hover': {
      backgroundColor: unitData.filter(x => x.modem_number == activeModem)[0].transmitting
        ? theme.palette.error.main
        : theme.palette.critical.main,
      color: unitData.filter(x => x.modem_number == activeModem)[0].transmitting ? 'black' : 'white',
    },
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
      {unitData
        .sort((a, b) => a.id - b.id)
        .map((x, index) => {
          if (x.unit == unit)
            return <TxModemButton key={index} modem={x.modem_number} transmitting={x.transmitting} id={x.id} />;
        })}
    </Box>
  );
  const TxModemButton = ({ modem, transmitting }) => (
    <Button
      sx={{
        backgroundColor: modem == activeModem ? theme.palette.primary.dark : theme.palette.primary.light2,
        border: transmitting ? '2px solid red' : '2px solid ' + theme.palette.primary.main,
        color: modem == activeModem ? 'white' : 'black',
        width: '1em',
        margin: '8px',
        outline: 'none',
        '&:hover': {
          backgroundColor: modem == activeModem ? theme.palette.primary.main : theme.palette.primary.light,
        },
      }}
      onClick={e => {
        setActiveModem(modem, e);
      }}
    >
      {modem}
    </Button>
  );
  TxModemButton.propTypes = { modem: PropTypes.number, id: PropTypes.number };

  // Modem User Inputs
  const TxModemInput = () => {
    const currentModem = unitData.map(x => x.modem_number).indexOf(activeModem);
    const currentRow = sewAppCtx.tx.map(x => x.id).indexOf(unitData[currentModem].id);
    const [inputData, setInputData] = useState(sewAppCtx.tx[currentRow]);
    const [modemPower, setModemPower] = useState(inputData.bandwidth * Math.pow(10, (120 + inputData.power) / 10));

    const handleInputChange = ({ param, val }) => {
      if (param === 'power') {
        // if contains any symbols except - and number then return
        if (val.match(/[^0-9-]/g)) return;
        if (!isNaN(parseInt(val))) {
          val = parseInt(val);
        }
      }
      let tmpData = { ...inputData };
      tmpData[param] = val;
      setInputData(tmpData);
    };

    const handleApply = () => {
      let tmpData = [...sewAppCtx.tx];
      tmpData[currentRow] = { ...inputData };
      sewAppCtx.updateTx(tmpData);
      setModemPower(inputData.bandwidth * Math.pow(10, (120 + inputData.power) / 10));
      CRUDdataTable({ method: 'PATCH', path: 'transmitter', data: tmpData[currentRow] });
    };

    const handleTransmit = () => {
      let tmpData = [...sewAppCtx.tx];
      tmpData[currentRow].transmitting = !tmpData[currentRow].transmitting;
      sewAppCtx.updateTx(tmpData);
      // console.log('CRUD Tx: ', tmpData[currentRow]);
      CRUDdataTable({ method: 'PATCH', path: 'transmitter', data: tmpData[currentRow] });
    };

    return (
      <Box sx={sxInputBox}>
        <Box sx={sxInputRow}>
          <label htmlFor='Antenna'>Antenna</label>
          <select
            name='Antenna'
            value={inputData.antenna_id}
            onChange={e =>
              handleInputChange({
                param: 'antenna_id',
                val: parseInt(e.target.value) || 0,
              })
            }
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
          </select>
          <Typography sx={sxValues}>{sewAppCtx.tx[currentRow].antenna_id}</Typography>
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
                val: parseInt(e.target.value) || 0,
              })
            }
          ></input>
          <Typography sx={sxValues}>{sewAppCtx.tx[currentRow].frequency + ' MHz'}</Typography>
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
                val: parseInt(e.target.value) || 0,
              })
            }
          ></input>
          <Typography sx={sxValues}>{sewAppCtx.tx[currentRow].bandwidth + ' MHz'}</Typography>
        </Box>
        <Box sx={sxInputRow}>
          <label htmlFor='power'>Power</label>
          <input
            name='power'
            type='string'
            value={inputData.power}
            onChange={e => handleInputChange({ param: 'power', val: e.target.value })}
          ></input>
          <Typography sx={sxValues}>{`${sewAppCtx.tx[currentRow].power} dBm`}</Typography>
        </Box>
        <Box sx={sxInputRow}>
          <Typography>Power Consumed: {Math.round((100 * modemPower) / powerBudget)}%</Typography>
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
