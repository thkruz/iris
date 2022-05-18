import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import PropTypes from 'prop-types';
import { Box, Button, Typography } from '@mui/material';
import './RxModem.css';
import { AstroTheme } from '../../../../../../themes/AstroTheme';
import { useAntenna, useTx, useRx, useUpdateRx, useSignal } from '../../../../../../context';
import { antennas, satellites } from './../../../../../../constants';

export const RxModem = ({ unit }) => {
  //TODO: modem buttons, update state, video,
  const theme = AstroTheme;
  let denied = false;
  const rxData = useRx();
  const updateRxData = useUpdateRx();
  const signalData = useSignal();
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
  const sxCaseId = {
    color: 'white',
    margin: '8px',
    textAlign: 'center',
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
    const [inputData, setInputData] = useState(rxData[currentRow]);

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
          <Typography sx={sxValues}>{rxData[currentRow].antenna_id}</Typography>
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
          <Typography sx={sxValues}>{rxData[currentRow].frequency + ' MHz'}</Typography>
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
          <Typography sx={sxValues}>{rxData[currentRow].bandwidth + ' MHz'}</Typography>
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
          <Typography sx={sxValues}>{rxData[currentRow].modulation}</Typography>
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
          <Typography sx={sxValues}>{rxData[currentRow].fec}</Typography>
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
    const [matchFound, setMatchFound] = useState(false);
    const [vidFeed, setVidFeed] = useState('');
    const [deniedFound, setDeniedFound] = useState(false);

    const txData = useTx();
    const antenna = useAntenna();

    const currentRow = (unit - 1) * 4 + activeModem;

    const { frequency: r_freq, bandwidth: r_bw, modulation: r_mod, fec: r_fec } = rxData[currentRow];
    const { target_id: r_tgt, band: r_band } = antenna[rxData[currentRow].antenna_id - 1];

    useEffect(() => {
      signalData?.forEach(signal => {
        const {
          frequency: s_freq,
          bandwidth: s_bw,
          modulation: s_mod,
          fec: s_fec,
          target_id: s_tgt,
          feed,
          power,
        } = signal; // TODO: loop through all signals to find one that matches
        const dc_offset = antennas[r_band]?.downconvert / 1e6;
        const if_freq = s_freq - dc_offset; //rf_freq
        const s_lb = if_freq - 0.5 * s_bw;
        const s_rb = if_freq + 0.5 * s_bw;
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
          r_fec === s_fec && // reciever fec rate matches
          r_tgt === s_tgt; // satellites match
        if (rxMatch) {
          let degraded = '';
          const activeTransmitters = txData.filter(x => x.transmitting);
          activeTransmitters.forEach(transmission => {
            const { frequency: t_freq, bandwidth: t_bw, power: t_power } = transmission;
            const { target_id: t_tgt, band: t_band, offset: t_offset } = antenna[transmission.antenna_id - 1];
            const t_uc_offset = antennas[t_band]?.upconvert / 1e6;
            const t_dc_offset = antennas[t_band]?.downconvert / 1e6;
            console.log(t_tgt);
            const s_offset = satellites[t_tgt - 1].offset / 1e6;
            const offset =
              !antenna[transmission.antenna_id - 1].loopback && antenna[transmission.antenna_id - 1].hpa
                ? s_offset
                : t_offset;
            const t_if_freq = t_freq + t_uc_offset + offset - t_dc_offset;
            const t_lb = t_if_freq - 0.5 * t_bw;
            const t_rb = t_if_freq + 0.5 * t_bw;
            if (t_lb <= s_rb && t_rb >= s_lb && t_tgt === s_tgt) degraded = 'degraded ';
            if (t_lb <= s_lb && t_rb >= s_rb && t_tgt === s_tgt && t_power > power) {
              denied = true;
              setDeniedFound(true);
            }
            console.log(t_lb, s_lb, t_rb, s_rb);
          });
          setVidFeed(`${degraded}${feed}`);
          setMatchFound(true);
          if (!deniedFound) denied = false;
        }
      });
    }, [signalData]);

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
