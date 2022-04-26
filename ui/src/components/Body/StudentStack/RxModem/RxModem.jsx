import React, {useState} from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Typography } from '@mui/material';
import './RxModem.css'
import { AstroTheme } from '../../../../themes/AstroTheme';

export const RxModem = ({ unit }) => {
    //TODO: modem buttons, update state, video, 
    const theme = AstroTheme
    const tmpRxData = [
        {unit: 1, number: 1, operational: true, antenna: 1, frequency: 1100, bandwidth: 25, modulation: '8PSK', fec: '3/5'},
        {unit: 1, number: 2, operational: true, antenna: 1, frequency: 1200, bandwidth: 35, modulation: 'BPSK', fec: '1/2'},
        {unit: 1, number: 3, operational: true, antenna: 1, frequency: 1300, bandwidth: 45, modulation: 'QPSK', fec: '3/4'},
        {unit: 1, number: 4, operational: true, antenna: 1, frequency: 1400, bandwidth: 55, modulation: '16PSK', fec: '1/2'}
    ];
    const [rxData] = useState(tmpRxData);
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
        justifyContent: 'space-between'
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
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'end',
        justifyContent: 'flex-end'
    };
    const sxInputRow = {
        display: 'grid',
        gridTemplateColumns: '80px 80px 80px', 
        textAlign: 'right', 
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
        backgroundColor: 'white',
        width: '200px',
        height: '200px'
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
    )

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
    const inputs = [];
    ['Antenna', 'Frequency', 'Bandwidth', 'Modulation', 'FEC'].forEach((x, index) => {
        inputs.push(
            <Box key={index} sx={sxInputRow}>
                <label htmlFor={x}>{x}</label>
                <input name={x} type='text' placeholder={rxData[activeModem][x.toLowerCase()]}></input>
                <Typography sx={sxValues}>{rxData[activeModem][x.toLowerCase()]}</Typography>
            </Box>
        )
    });

    const RxModemInput = () => (
        <Box sx={sxInputBox}>
            {inputs}    
            <Button sx={sxInputApply} onClick={e => console.log(e.target.innerText)}>Apply</Button>
        </Box>
    );
    
    const RxVideo = () => (
        <Box sx={sxVideo}>
            Video Goes Here
        </Box>
    );

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