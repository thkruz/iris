import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import PropTypes from 'prop-types';
import { RuxContainer, RuxButton, RuxPushButton, RuxSelect, RuxOption, RuxInput } from '@astrouxds/react'
import { Box, Button, Typography } from '@mui/material';
import './Injects.css';
import { AstroTheme } from '../../../../themes/AstroTheme';
import { satellites } from '../../../../constants';
import { CRUDdataTable } from '../../../../crud/crud';
import { useSewApp } from '../../../../context/sewAppContext';

export const Injects = () => {
  const sewAppCtx = useSewApp();
  
  useEffect(() => {
    fetch('http://localhost:8080/data/signal')
        .then(res => res.json())
        .then(res => sewAppCtx.updateSignal(res))
  }, [])
  
  const theme = AstroTheme;
  const [activeModem, setActiveModem] = useState(0);

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
  const sxValues = {
    fontWeight: 'bold',
    textDecoration: 'underline',
    marginLeft: '8px',
  };
  const sxInputRow = {
    display: 'grid',
    gridTemplateColumns: '280px 160px',
    textAlign: 'left',
    margin: '8px',
  };
  const sxVideo = {
    width: '400px',
    height: '400px',
  };
  // const sxTransmit = {
  //   cursor: 'pointer',
  //   margin: '8px',
  //   boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.5)',
  //   border: '1px solid red',
  //   backgroundColor: sewAppCtx.signal[activeModem]?.operational ? 'red' : theme.palette.tertiary.light3,
  //   color: sewAppCtx.signal[activeModem]?.operational ? 'white' : 'black',
  //   '&:hover': {
  //     backgroundColor: sewAppCtx.signal[activeModem]?.operational
  //       ? theme.palette.error.main
  //       : theme.palette.critical.main,
  //     color: sewAppCtx.signal[activeModem]?.operational ? 'black' : 'white',
  //   },
  // };

  // Modem Case Id
  const sidebar = [];
  ['S', 'I', 'G', 'N', 'A', 'L', 'S'].forEach((x, index) => {
    sidebar.push(
      <Typography key={index}>
              {x}
      </Typography>
    );
  });
  const RxCaseId = () => <Box sx={sxCaseId}>{sidebar}</Box>;
  // Modem selector buttons
  const RxModemButtonBox = () => (
    <RuxContainer sx={sxModemButtonBox}>
      {sewAppCtx.signal
        .sort((a, b) => a.id - b.id)
        .map((x, index) => (
          <RxModemButton key={index} modem={x.id} />
        ))}
    </RuxContainer>
  );
  const RxModemButton = ({ modem }) => {
    const timer = useRef();

    const onClickHandler = (e) => {
      clearTimeout(timer.current);
      if (e.detail === 1) {
        timer.current = setTimeout(setActiveModem(parseInt(e.target.innerText) - 1), 200);
      } else if (e.detail === 2) {
        let tmpData = [...sewAppCtx.signal];
        tmpData[activeModem].operational = !tmpData[activeModem].operational;
        sewAppCtx.updateSignal(tmpData);
        CRUDdataTable({ method: 'PATCH', path: 'signal', data: tmpData[activeModem] });
      }
    };
    return (
      <Button
        sx={{
          backgroundColor: modem - 1 == activeModem ? theme.palette.primary.dark : theme.palette.primary.light2,
          color: modem - 1 == activeModem ? 'white' : 'black',
          border: sewAppCtx.signal[sewAppCtx.signal.map((x) => x.id).indexOf(modem)].operational
            ? '2px solid red'
            : '2px solid ' + theme.palette.primary.main,
          margin: '8px',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: theme.palette.primary.light3,
          },
        }}
        onClick={(e) => {
          onClickHandler(e);
        }}>
        {modem}
      </Button>
    );
  };
  RxModemButton.propTypes = { modem: PropTypes.number };

  // Modem User Inputs
  const RxModemInput = () => {
    const index = sewAppCtx.signal.map((x) => x.id).indexOf(activeModem + 1);
    const [inputData, setInputData] = useState(sewAppCtx.signal[index]);
    const handleInputChange = ({ param, val }) => {
      let tmpData = { ...inputData };
      tmpData[param] = val;
      setInputData(tmpData);
    };

    const handleApply = () => {
      const tmpData = [...sewAppCtx.signal];
      tmpData[index] = inputData;
      sewAppCtx.updateSignal(tmpData);
      CRUDdataTable({ method: 'PATCH', path: 'signal', data: tmpData[index] });
    };

    const handleTransmit = () => {
      let tmpData = [...sewAppCtx.signal];
      tmpData[index].operational = !tmpData[index].operational;
      sewAppCtx.updateSignal(tmpData);
      CRUDdataTable({ method: 'PATCH', path: 'signal', data: tmpData[index] });
    };

    console.log(sewAppCtx.signal)

    return (
      <RuxContainer style={{ marginRight: '0', marginLeft: '0' }}>
        <Box style={sxInputRow}>
          <RuxSelect
            className='instructor_select'
            name='Satellite'
            label='Satellite'
            value={inputData.target_id}
            onRuxchange={(e) =>
              handleInputChange({
                param: 'target_id',
                val: parseInt(e.target.value),
              })
            }>
            {satellites.map((x, index) => (
              <RuxOption key={index} value={x.id} label={x.name}>
                {x.name}
              </RuxOption>
            ))}
          </RuxSelect>
          <Typography sx={sxValues}>{satellites[sewAppCtx.signal[index]]?.name}</Typography>
        </Box>
        <Box style={sxInputRow}>
          <RuxInput
            className='instructor_input'
            name='frequency'
            type='text'
            label='Frequency'
            value={inputData.frequency}
            onRuxchange={(e) =>
              handleInputChange({
                param: 'frequency',
                val: parseInt(e.target.value) || 0,
              })
            }></RuxInput>
          <Typography sx={sxValues}>{sewAppCtx.signal[index].frequency + ' MHz'}</Typography>
        </Box>
        <Box style={sxInputRow}>
          <RuxInput
            className='instructor_input'
            name='bandwidth'
            type='text'
            label="Bandwidth"
            value={inputData.bandwidth}
            onRuxchange={(e) =>
              handleInputChange({
                param: 'bandwidth',
                val: parseInt(e.target.value) || 0,
              })
            }></RuxInput>
          <Typography sx={sxValues}>{sewAppCtx.signal[index].bandwidth + ' MHz'}</Typography>
        </Box>
        <Box style={sxInputRow}>
          <RuxSelect
            className='instructor_select'
            name='modulation'
            value={inputData.modulation}
            label='Modulation'
            onRuxchange={(e) => handleInputChange({ param: 'modulation', val: e.target.value || 0 })}>
            <RuxOption value='BPSK' label='BPSK'>BPSK</RuxOption>
            <RuxOption value='QPSK' label='QPSK'>QPSK</RuxOption>
            <RuxOption value='8QAM' label='8QAM'>8QAM</RuxOption>
            <RuxOption value='16QAM' label='16QAM'>16QAM</RuxOption>
          </RuxSelect>
          <Typography sx={sxValues}>{sewAppCtx.signal[index].modulation}</Typography>
        </Box>
        <Box style={sxInputRow}>
          <RuxSelect
            className='instructor_select'
            name='fec'
            value={inputData.fec}
            label='FEC'
            onRuxchange={(e) => handleInputChange({ param: 'fec', val: e.target.value || 0 })}>
            <RuxOption value='1/2' label='1/2'>1/2</RuxOption>
            <RuxOption value='2/3' label='2/3'>2/3</RuxOption>
            <RuxOption value='3/4' label='3/4'>3/4</RuxOption>
            <RuxOption value='5/6' label='5/6'>5/6</RuxOption>
            <RuxOption value='7/8' label='7/8'>7/8</RuxOption>
          </RuxSelect>
          <Typography sx={sxValues}>{sewAppCtx.signal[index].fec}</Typography>
        </Box>
        <Box style={sxInputRow}>
          <RuxSelect
            className='instructor_select'
            name='feed'
            label='Feed'
            value={inputData.feed}
            onRuxchange={(e) => handleInputChange({ param: 'feed', val: e.target.value })}>
            <RuxOption value='blue 1.mp4' label='blue 1.mp4'>Blue 1</RuxOption>
            <RuxOption value='blue 2.mp4' label='blue 2.mp4'>Blue 2</RuxOption>
            <RuxOption value='red 1.mp4' label='red 1.mp4'>Red 1</RuxOption>
            <RuxOption value='red 2.mp4' label='red 2.mp4'>Red 2</RuxOption>
            <RuxOption value='red 3.mp4' label='red 3.mp4'>Red 3</RuxOption>
            <RuxOption value='red 4.mp4' label='red 4.mp4'>Red 4</RuxOption>
            <RuxOption value='red 5.mp4' label='red 5.mp4'>Red 5</RuxOption>
            <RuxOption value='red 6.mp4' label='red 6.mp4'>Red 6</RuxOption>
            <RuxOption value='red 7.mp4' label='red 7.mp4'>Red 7</RuxOption>
            <RuxOption value='red 8.mp4' label='red 8.mp4'>Red 8</RuxOption>
            <RuxOption value='red 9.mp4' label='red 9.mp4'>Red 9</RuxOption>
          </RuxSelect>
          <Typography sx={sxValues}>{sewAppCtx.signal[activeModem].feed}</Typography>
        </Box>
        <Box style={sxInputRow}>
          <div></div>
          <div style={{ display: 'flex', }}>
          <RuxButton style={{ marginRight: '8px', }} onClick={(e) => handleApply(e)}>
            Apply
          </RuxButton>
          <RuxPushButton label='TX' onRuxchange={(e) => {handleTransmit(e)}} 
            checked={ sewAppCtx.signal[index].operational ? true : false}
          />
          </div>
        </Box>
      </RuxContainer>
    );
  };

  const RxVideo = () => {
    return (
      <RuxContainer style={sxVideo}>
        <ReactPlayer
          config={{ file: { attributes: { controlsList: 'nodownload' } } }}
          // onContextMenu={(e) => e.preventDefault()}
          url={`./videos/${sewAppCtx.signal[activeModem].feed}`}
          width='100%'
          height='100%'
          controls={false}
          playing={true}
          loop={true}
          pip={false}
          muted={true}
        />
      </RuxContainer>
    );
  };

  return (
    <div className='instructor_wrapper'>
        <RxCaseId />
        <RxModemButtonBox />
        <RxModemInput />
        <RxVideo />
    </div>
  );
};
