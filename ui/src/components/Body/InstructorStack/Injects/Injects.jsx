import React, { useState } from 'react';
import ReactPlayer from 'react-player';
import PropTypes from 'prop-types';
import { Box, Button, Typography } from '@mui/material';
import './Injects.css';
import { AstroTheme } from '../../../../themes/AstroTheme';
import { useSignal, useUpdateSignal } from '../../../../context';
import { satellites } from '../../../../constants';

export const Injects = () => {
  const signals = useSignal()
  const setSignals = useUpdateSignal();
  //TODO: modem buttons, update state, video,
  const theme = AstroTheme;
  const [activeModem, setActiveModem] = useState(0);

  // Styles
  const sxCase = {
    flexGrow: 1,
    backgroundColor: theme.palette.tertiary.light2,
    borderRadius: '10px',
    boxShadow: '0px 0px 5px rgba(0,0,0,0.5)',
    border: '1px solid' + AstroTheme.palette.tertiary.light,
    display: 'grid',
    gridTemplateColumns: '30px 1fr 4fr 3fr 5fr',
    justifyContent: 'space-between',
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
  };
  const sxModemButtonBox = {
    backgroundColor: theme.palette.tertiary.light3,
    borderRadius: '5px',
    boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.2)',
  };
  const sxModemButton = {
    backgroundColor: theme.palette.primary.light2,
    border: '2px solid ' + theme.palette.primary.main,
    color: 'black',
    margin: '8px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.primary.light3,
    },
  };
  const sxModemButtonActive = {
    backgroundColor: theme.palette.primary.dark,
    border: '2px solid ' + theme.palette.primary.main,
    color: 'white',
    width: '1em',
    margin: '8px',
    outline: 'none',
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
    },
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
  const sxVideo = {
    margin: '10px',
    border: '2px solid grey',
    backgroundColor: theme.palette.tertiary.light3,
    width: '200px',
    height: '200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  // Modem Case Id
  const sidebar = [];
  ['S', 'I', 'G', 'N', 'A', 'L', 'S'].forEach((x, index) => {
    sidebar.push(
      <Typography key={index} sx={{ color: 'black' }}>
        {x}
      </Typography>
    );
  });
  // Modem selector buttons
  const RxModemButtonBox = () => (
    <Box sx={sxModemButtonBox}>
      {signals.map((x, index) => {
        if (x.unit == unit) return <RxModemButton key={index} modem={x.number} />;
      })}
    </Box>
  );
  const RxModemButton = ({ modem }) => (
    <Button
      sx={modem - 1 == activeModem ? sxModemButtonActive : sxModemButton}
      onClick={e => {
        setActiveModem(parseInt(e.target.innerText) - 1);
      }}>
      {modem}
    </Button>
  );
  RxModemButton.propTypes = { modem: PropTypes.number };

  // Modem User Inputs
  const RxModemInput = () => {
    const currentRow = (unit - 1) * 4 + activeModem;
    const [inputData, setInputData] = useState(signals[currentRow]);

    const handleInputChange = ({ param, val }) => {
      let tmpData = { ...inputData };
      tmpData[param] = val;
      setInputData(tmpData);
    };

    const handleApply = () => {
      updateRxData(inputData, currentRow);
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
            }>
            <option value={1}>1</option>
            <option value={2}>2</option>
          </select>
          <Typography sx={sxValues}>{signals[currentRow].antenna_id}</Typography>
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
            }></input>
          <Typography sx={sxValues}>{signals[currentRow].frequency + ' MHz'}</Typography>
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
            }></input>
          <Typography sx={sxValues}>{signals[currentRow].bandwidth + ' MHz'}</Typography>
        </Box>
        <Box sx={sxInputRow}>
          <label htmlFor='modulation'>Modulation</label>
          <select
            name='modulation'
            value={inputData.modulation}
            onChange={e => handleInputChange({ param: 'modulation', val: e.target.value || 0 })}>
            <option value='BPSK'>BPSK</option>
            <option value='QPSK'>QPSK</option>
            <option value='8QAM'>8QAM</option>
            <option value='16QAM'>16QAM</option>
          </select>
          <Typography sx={sxValues}>{signals[currentRow].modulation}</Typography>
        </Box>
        <Box sx={sxInputRow}>
          <label htmlFor='fec'>FEC</label>
          <select
            name='fec'
            value={inputData.fec}
            onChange={e => handleInputChange({ param: 'fec', val: e.target.value || 0 })}>
            <option value='1/2'>1/2</option>
            <option value='2/3'>2/3</option>
            <option value='3/4'>3/4</option>
            <option value='5/6'>5/6</option>
            <option value='7/8'>7/8</option>
          </select>
          <Typography sx={sxValues}>{signals[currentRow].fec}</Typography>
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

  const RxVideo = () => {
    return (
      <Box sx={sxVideo}>
          <ReactPlayer
            url={`/videos/${inputData.feed}`}
            width='100%'
            height='100%'
            controls={false}
            playing={true}
            loop={true}
            pip={false}
            muted={true}
          />
      </Box>
    );
  };

  return (
    <>
      <Box sx={sxCase}>
        <RxCaseId />
        <RxModemButtonBox />
        <RxModemInput />
        <RxVideo />
      </Box>
    </>
  );
};

Injects.propTypes = {
  unit: PropTypes.number,
  tmpRxData: PropTypes.array,
};
