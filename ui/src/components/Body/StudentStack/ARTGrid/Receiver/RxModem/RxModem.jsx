import React, { useState } from 'react';
import ReactPlayer from 'react-player';
import PropTypes from 'prop-types';
import { Box, Button, Typography } from '@mui/material';
import './RxModem.css';
import { AstroTheme } from '../../../../../../themes/AstroTheme';
import { useAntenna, useRx, useUpdateRx } from '../../../../../../context';


export const RxModem = ({ unit }) => {
  //TODO: modem buttons, update state, video,
  const theme = AstroTheme;
  const degraded = false; // TODO: These may come from context
  const denied = false; // TODO: These may come from context
  const rxData = useRx();
  const updateRxData = useUpdateRx();
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
  const sxModemButton = {
    backgroundColor: theme.palette.primary.light,
    boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.75)',
    color: 'black',
    margin: '8px',
    cursor: 'pointer',
  };
  const sxModemButtonActive = {
    backgroundColor: theme.palette.primary.dark,
    boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.75)',
    color: 'white',
    width: '1em',
    margin: '8px',
    outline: 'none',
  };
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
  const sxVideo = {
    margin: '10px',
    border: '2px solid grey',
    backgroundColor: theme.palette.primary.light,
    width: '200px',
    height: '200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  // Modem Case Id
  const sidebar = [];
  ['R', 'X'].forEach((x, index) => {
    sidebar.push(
      <Typography key={index} sx={{ color: 'black' }}>
        {x}
      </Typography>
    );
  });
  const RxCaseId = () => (
    <Box sx={sxCaseId}>
      {sidebar}
      <br></br>
      <Typography>{unit}</Typography>
    </Box>
  );
  // Modem selector buttons
  const RxModemButtonBox = () => (
    <Box sx={sxModemButtonBox}>
      {rxData.map((x, index) => {
        if (x.unit == unit) return <RxModemButton key={index} modem={x.modem} />;
      })}
    </Box>
  );
  const RxModemButton = ({ modem }) => (
    <Button
      sx={modem === activeModem + 1 ? sxModemButtonActive : sxModemButton}
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
    const [inputData, setInputData] = useState(rxData[currentRow]);
    const handleInputChange = ({ param, val }) => {
      let tmpData = { ...inputData };
      tmpData[param] = val;
      setInputData(tmpData);
    };
    const handleApply = () => {
      let tmpData = [...rxData];
      tmpData[currentRow] = inputData;
      updateRxData(tmpData);
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
          <Typography sx={sxValues}>{rxData[activeModem].id_antenna}</Typography>
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
          <Typography sx={sxValues}>{rxData[activeModem].frequency + ' MHz'}</Typography>
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
          <Typography sx={sxValues}>{rxData[activeModem].bandwidth + ' MHz'}</Typography>
        </Box>
        <Box sx={sxInputRow}>
          <label htmlFor='modulation'>Modulation</label>
          <select
            name='modulation'
            value={inputData.modulation}
            onChange={e => handleInputChange({ param: 'modulation', val: e.target.value })}>
            <option value='BPSK'>BPSK</option>
            <option value='QPSK'>QPSK</option>
            <option value='8QAM'>8QAM</option>
            <option value='16QAM'>16QAM</option>
          </select>
          <Typography sx={sxValues}>{rxData[activeModem].modulation}</Typography>
        </Box>
        <Box sx={sxInputRow}>
          <label htmlFor='fec'>FEC</label>
          <select
            name='fec'
            value={inputData.fec}
            onChange={e => handleInputChange({ param: 'fec', val: e.target.value })}>
            <option value='1/2'>1/2</option>
            <option value='2/3'>2/3</option>
            <option value='3/4'>3/4</option>
            <option value='5/6'>5/6</option>
            <option value='7/8'>7/8</option>
          </select>
          <Typography sx={sxValues}>{rxData[activeModem].fec}</Typography>
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
    let matchFound = false;
    let vidFeed = '';

    const { frequency: r_freq, bandwidth: r_bw, modulation: r_mod, fec: r_fec } = rxData[(unit - 1) * 4 + activeModem];
    const antenna = useAntenna();
    const { id_target: r_tgt } = antenna[rxData[(unit - 1) * 4 + activeModem].id_antenna - 1];

    window.sewApp.environment?.signals?.forEach(signal => {
      const { frequency: s_freq, bandwidth: s_bw, modulation: s_mod, fec: s_fec, target_id: s_tgt, feed } = signal; // TODO: loop through all signals to find one that matches
      const s_lb = s_freq - 0.5 * s_bw;
      const s_rb = s_freq + 0.5 * s_bw;
      const s_flb = s_lb - 0.5 * s_bw;
      const s_frb = s_rb + 0.5 * s_bw;
      const r_lb = r_freq - 0.5 * r_bw;
      const r_rb = r_freq + 0.5 * r_bw;
      const rxMatch =
        r_lb <= s_lb && // receiver left bound is withing tolerance
        r_lb >= s_flb &&
        r_rb >= s_rb && // receiver right bound is within tolerance
        r_rb <= s_frb &&
        r_mod === s_mod && // receiver modulation schema matches
        r_fec === s_fec &&
        r_tgt === s_tgt; // reciever fec rate matches

      if (rxMatch) {
        vidFeed = degraded ? `degraded_${feed}` : feed;
        matchFound = true;
      }
    });
    return (
      <Box sx={sxVideo}>
        {matchFound && !denied ? (
          <ReactPlayer
            url={`/videos/${vidFeed}`}
            width='100%'
            height='100%'
            controls={false}
            playing={true}
            loop={true}
            pip={false}
            muted={true}
          />
        ) : (
          'No Signal'
        )}
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

RxModem.propTypes = {
  unit: PropTypes.number,
  tmpRxData: PropTypes.array,
};
