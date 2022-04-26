import React, {useState} from 'react';
import ReactPlayer from 'react-player';
import PropTypes from 'prop-types';
import { Box, Button, Typography } from '@mui/material';
import './RxModem.css'
import { AstroTheme } from '../../../../themes/AstroTheme';

export const RxModem = ({ unit }) => {
    //TODO: modem buttons, update state, video, 
    const theme = AstroTheme
    const tmpRxData = [
        {unit: 1, number: 1, operational: true, id_antenna: 1, frequency: 1100, bandwidth: 25, modulation: '8QAM', fec: '3/4'},
        {unit: 1, number: 2, operational: true, id_antenna: 1, frequency: 1200, bandwidth: 35, modulation: 'BPSK', fec: '1/2'},
        {unit: 1, number: 3, operational: true, id_antenna: 2, frequency: 1300, bandwidth: 45, modulation: 'QPSK', fec: '7/8'},
        {unit: 1, number: 4, operational: true, id_antenna: 2, frequency: 1400, bandwidth: 55, modulation: '16QAM', fec: '5/6'}
    ];
    const [rxData, setRxData] = useState(tmpRxData);
    const [activeModem, setActiveModem] = useState(0);
    
    // Styles
    const sxCase = {
        flexGrow: 1,
        width: '600px',
        backgroundColor: theme.palette.primary.main,
        borderRadius: '10px',
        border: '1px solid black',
        display:'grid', 
        gridTemplateColumns: '1fr 1fr 4fr 3fr 5fr',
        justifyContent: 'space-between',
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif"
    };
    const sxCaseId = {
        color: 'white',
        margin: '8px',
        textAlign: 'center'
    };
    const sxModemButtonBox = {
        backgroundColor: theme.palette.primary.light,
        borderRadius: '5px',
        boxShadow: '0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19)'
    };
    const sxModemButton = {
        backgroundColor: theme.palette.primary.light,
        boxShadow: '0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19)',
        color: 'black',
        margin: '8px',
        cursor: 'pointer'
    };
    const sxModemButtonActive = {
        backgroundColor: theme.palette.primary.dark,
        boxShadow: '0 12px 16px 0 rgba(0,0,0,0.24), 0 17px 50px 0 rgba(0,0,0,0.19)',
        color: 'white',
        width: '1em',
        margin: '8px',
        outline: 'none'
    };
    const sxValues = {
        fontWeight: 'bold',
        textDecoration: 'underline'
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
        margin: '2px'
    };
    const sxInputApply = {
        backgroundColor: theme.palette.primary.light,
        boxShadow: '0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19)',
        color: 'black',
        margin: '8px',
        cursor: 'pointer'
    }
    const sxVideo = {
        margin: '10px',
        border: '1px solid black',
        backgroundColor: theme.palette.primary.light,
        width: '200px',
        height: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }

     // Modem Case Id
     const sidebar = [];
     ['U','N','I','T'].forEach((x, index) => {
         sidebar.push(<Typography key={index} sx={{color: 'black'}}>{x}</Typography>)
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
            {rxData.map((x, index) => (
                <RxModemButton key={index} modem={x.number} />
            ))}
        </Box>
    );
    const RxModemButton = ({ modem }) => (
        <Button sx={modem === activeModem + 1 ? sxModemButtonActive : sxModemButton}
        onClick={e => {setActiveModem(parseInt(e.target.innerText) - 1); console.log(activeModem)}}>
                {modem}
        </Button>
    );
    RxModemButton.propTypes = {modem: PropTypes.number};

    // Modem User Inputs
    const RxModemInput = () => {
        const [inputData, setInputData] = useState(tmpRxData[0])
        const handleInputChange = ({ param, val }) => {
            console.log(param, val);

            if((param === 'frequency' | param === 'bandwidth') && (isNaN(val) | val <= 0)) val = 1000
            let tmpData = {...inputData};
            tmpData[param] = val;
            console.log(tmpData == inputData);
            setInputData(tmpData);
        }
        const handleApply = () => {
            let tmpData = [...rxData];
            tmpData[activeModem] = inputData;
            console.log(inputData)
            setRxData(tmpData);
        }
        return(
            <Box sx={sxInputBox}>
                <Box sx={sxInputRow}>
                    <label htmlFor='Antenna'>Antenna</label>
                    <select
                        name='Antenna'
                        value={inputData.id_antenna}
                        onChange={e => handleInputChange({param:'id_antenna', val:e.target.value})}
                        >
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                    </select>
                    <Typography sx={sxValues}>
                        {rxData[activeModem].id_antenna}
                    </Typography>
                </Box>
                <Box sx={sxInputRow}>
                    <label htmlFor='frequency'>Frequency</label>
                    <input 
                        name='frequency'
                        type='text'
                        value={inputData.frequency}
                        onChange={e => handleInputChange({param: 'frequency', val: parseInt(e.target.value)})}
                        >
                    </input>
                    <Typography sx={sxValues}>
                        {rxData[activeModem].frequency + ' MHz'}
                    </Typography>
                </Box>
                <Box sx={sxInputRow}>
                    <label htmlFor='bandwidth'>Bandwidth</label>
                    <input 
                        name='bandwidth'
                        type='text'
                        value={inputData.bandwidth}
                        onChange={e => handleInputChange({param: 'bandwidth', val: parseInt(e.target.value)})}
                        >
                    </input>
                    <Typography sx={sxValues}>
                        {rxData[activeModem].bandwidth + ' MHz'}
                    </Typography>
                </Box>
                <Box sx={sxInputRow}>
                    <label htmlFor='modulation'>Modulation</label>
                    <select 
                        name='modulation'
                        value={inputData.modulation}
                        onChange={e => handleInputChange({param:'modulation', val:e.target.value})}
                        >
                        <option value='BPSK'>BPSK</option>
                        <option value='QPSK'>QPSK</option>
                        <option value='8QAM'>8QAM</option>
                        <option value='16QAM'>16QAM</option>
                    </select>
                    <Typography sx={sxValues}>
                        {rxData[activeModem].modulation}
                    </Typography>
                </Box>
                <Box sx={sxInputRow}>
                    <label htmlFor='fec'>FEC</label>
                    <select 
                        name='fec'
                        value={inputData.fec}
                        onChange={e => handleInputChange({param:'fec', val:e.target.value})}
                        >
                        <option value='1/2'>1/2</option>
                        <option value='2/3'>2/3</option>
                        <option value='3/4'>3/4</option>
                        <option value='5/6'>5/6</option>
                        <option value='7/8'>7/8</option>
                    </select>
                    <Typography sx={sxValues}>
                        {rxData[activeModem].fec}
                    </Typography>
                </Box>
                <Box sx={sxInputRow}>
                    <div></div>
                    <Button sx={sxInputApply} onClick={e => handleApply(e)}>Apply</Button>
                </Box>
            </Box>
        )
    };
    
    const RxVideo = () => {
        //const [videoFilePath] = useState('/videos/testVid2.mov')
        const vidPath = ['/videos/testVid.mov', 'videos/testVid.mp4', 'videos/testVid2.mov', 'videos/testVid.mp4']
        return(
            <Box sx={sxVideo}>
                <ReactPlayer 
                    url={vidPath[unit-1]} 
                    width='100%' 
                    height='100%' 
                    contorls={false}
                    playing={true}
                    loop={true} />
            </Box>
        )
    };

    return(
        <>
            <Box sx={sxCase}>
                <RxCaseId />
                <RxModemButtonBox />
                <RxModemInput />
                <RxVideo />
            </Box>
        </>
    )
}

RxModem.propTypes = {
    unit: PropTypes.number
}