import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Button } from '@mui/material';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import CellTowerIcon from '@mui/icons-material/CellTower';
import AlignHorizontalCenterIcon from '@mui/icons-material/AlignHorizontalCenter';
import { AstroTheme } from '../../../../../themes/AstroTheme';
import { useAntenna, useUpdateAntenna, useUser } from '../../../../../context';
import { antennas, satellites } from '../../../../../constants';
import './Antenna.css';
import { CRUDdataTable } from '../../../../../crud/crud';

export const AntennaController = ({ unit }) => {
  const user = useUser()
  const theme = AstroTheme;
  const antennaContext = useAntenna();
  const setAntennaData = useUpdateAntenna();
  const unitData = antennaContext.filter(x => x.unit == unit && x.team_id == user.team_id && x.server_id == user.server_id)
  const index = antennaContext.map(x => x.id).indexOf(unitData[0].id)

  // Styles
  const sxAntennaCase = {
    flexGrow: 1,
    margin: 'auto',
    borderRadius: '10px',
    boxShadow: '0px 0px 5px rgba(0,0,0,0.5)',
    backgroundColor: AstroTheme.palette.tertiary.light2,
    border: '1px solid' + AstroTheme.palette.tertiary.light,
    display: 'grid',
    gridTemplateColumns: '30px 6fr 12fr',
    justifyContent: 'space-between',
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
  };
  const sxAntennaCaseId = {
    color: 'white',
    margin: '8px',
    textAlign: 'center',
  };
  const sxValues = {
    fontWeight: 'bold',
    textDecoration: 'underline',
  };
  const sxInputBox = {
    backgroundColor: AstroTheme.palette.tertiary.light2,
    margin: '8px',
    borderRadius: '4px',
    display: 'grid',
    flexDirection: 'column',
  };
  const sxInputRow = {
    display: 'grid',
    gridTemplateColumns: '100px 100px 100px',
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
  const sxLoopback = {
    width: '100px',
    padding: '8px',
    borderRadius: '5px',
    backgroundColor: theme.palette.tertiary.light3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.75)',
  };
  const sxLoopbackSwitch = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  };
  const sxHPA = {
    marginTop: '5px',
    backgroundColor: antennaContext[index].hpa ? 'red' : theme.palette.tertiary.light3,
    color: antennaContext[index].hpa ? 'white' : 'black',
    boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.5)',
    border: '1px solid red',
    '&:hover': {
      backgroundColor: antennaContext[index].hpa ? theme.palette.error.main : theme.palette.critical.main,
      color: antennaContext[index].hpa ? 'black' : 'white',
    },
  };
  const sxTx = {
    backgroundColor: antennaContext[index].loopback
      ? theme.palette.tertiary.light2
      : antennaContext[index].hpa
      ? 'red'
      : 'green',
    borderRadius: '10px',
  };
  // Modem Case Id
  const sidebar = [];
  ['A', 'N', 'T'].forEach((x, index) => {
    sidebar.push(
      <Typography key={index} sx={{ color: 'black' }}>
        {x}
      </Typography>
    );
  });
  const AntennaCaseId = () => (
    <Box sx={sxAntennaCaseId}>
      {sidebar}
      <br></br>
      <Typography>{unit}</Typography>
    </Box>
  );

  // Antenna User Inputs
  // Target Band Offset
  const AntennaInput = () => {
    const [inputData, setInputData] = useState(antennaContext[index]);
    const handleInputChange = ({ param, val }) => {
      if (param === 'offset') {
        // if contains any symbols except - and number then return
        if (val.match(/[^0-9-]/g)) return;
        if (!isNaN(parseInt(val))) {
          val = parseInt(val);
        }
      } else {
        val = parseInt(val);
      }
      const tmpInputData = { ...inputData };
      tmpInputData[param] = val;
      setInputData(tmpInputData);
    };
    const handleApply = () => {
      const tmpData = [...antennaContext];
      tmpData[index] = inputData;
      setAntennaData(tmpData);
      CRUDdataTable({method: 'PATCH', path: 'antenna', data: tmpData[index]})
    };
    return (
      <Box sx={sxInputBox}>
        <Box sx={sxInputRow}>
          <label htmlFor='Target'>Target</label>
          <select
            name='Target'
            value={inputData.target_id}
            onChange={e => handleInputChange({ param: 'target_id', val: e.target.value })}>
            {satellites.map((x, index) => {
              return (
                <option value={x.id} key={index}>
                  {x.name}
                </option>
              );
            })}
          </select>
          <Typography sx={sxValues}>{satellites[antennaContext[index].target_id - 1].name}</Typography>
        </Box>
        <Box sx={sxInputRow}>
          <label htmlFor='Band'>Band</label>
          <select
            name='band'
            value={inputData.band}
            onChange={e => handleInputChange({ param: 'band', val: e.target.value })}>
            {antennas.map((x, index) => {
              return (
                <option value={index} key={index}>
                  {x.band}
                </option>
              );
            })}
          </select>
          <Typography sx={sxValues}>{antennas[antennaContext[index]?.band]?.band}</Typography>
        </Box>
        <Box sx={sxInputRow}>
          <label htmlFor='offset'>Offset</label>
          <input
            name='offset'
            type='text'
            value={inputData.offset}
            onChange={e => {
              handleInputChange({ param: 'offset', val: e.target.value });
            }}></input>
          <Typography sx={sxValues}>{antennaContext[index].offset + ' MHz'}</Typography>
        </Box>
        <Box sx={sxInputRow}>
          <div></div>
          <Button sx={sxInputApply} onClick={e => handleApply(e)}>
            Apply
          </Button>
        </Box>
      </Box>
    );
  };

  // Baseball switch
  const LoopbackSwitch = () => {
    const toggleSwitch = () => {
      const tmpData = [...antennaContext];
      const loopback = tmpData[index].loopback;
      tmpData[index].loopback = !loopback;
      setAntennaData(tmpData);
      CRUDdataTable({method: 'PATCH', path: 'antenna', data: tmpData[index]})
    };
    const handleHPA = () => {
      const tmpData = [...antennaContext];
      const hpa = tmpData[index].hpa;
      tmpData[index].hpa = !hpa;
      setAntennaData(tmpData);
      CRUDdataTable({method: 'PATCH', path: 'antenna', data: tmpData[index]})
    };
    return (
      <Box sx={sxLoopback}>
        <Typography align='center'>IF</Typography>
        <Box sx={sxLoopbackSwitch}>
          <SettingsBackupRestoreIcon />
          <center>
            <img
              className='lb_img'
              src={`baseball_switch${antennaContext[index].loopback ? '' : '2'}.png`}
              alt='baseball_switch'
              onClick={e => toggleSwitch(e)}
            />
          </center>
          <CellTowerIcon sx={sxTx} />
        </Box>
        <AlignHorizontalCenterIcon />
        <Button sx={sxHPA} onClick={e => handleHPA(e)}>
          <Typography>HPA</Typography>
        </Button>
      </Box>
    );
  };

  return (
    <>
      <Box sx={sxAntennaCase}>
        <AntennaCaseId />
        <LoopbackSwitch />
        <AntennaInput />
      </Box>
    </>
  );
};

AntennaController.propTypes = {
  unit: PropTypes.number,
};
