import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Typography } from '@mui/material';
import './RxModem.css'

export const RxModem = () => {
    const RxData = [
        {unit: 1, number: 1, operational: true, id_antenna: 1, frequency: 1100, bandwidth: 25, modulation: '8PSK', fec: '3/5'},
        {unit: 1, number: 2, operational: true, id_antenna: 1, frequency: 1200, bandwidth: 35, modulation: 'BPSK', fec: '1/2'},
        {unit: 1, number: 3, operational: true, id_antenna: 1, frequency: 1300, bandwidth: 45, modulation: 'QPSK', fec: '3/4'},
        {unit: 1, number: 4, operational: true, id_antenna: 1, frequency: 1400, bandwidth: 55, modulation: '16PSK', fec: '1/2'}
    ];

    // Styles
    const sxCase = {
        flexGrow: 1,
        backgroundColor: 'gray',
        display:'grid', 
        gridTemplateColumns: '1fr 1fr 4fr 3fr 5fr',
        alignItems: 'center'
    };
    const sxCaseId = {
        transform: 'rotate(-90deg)',
        textAlign: 'center',
        backgroundColor: 'yellow'
    };
    const sxModemButtonBox = {
        backgroundColor: 'black'
    };
    const sxModemButton = {
        backgroundColor: 'red', 
        border: '1px solid black', 
        width: '1em',
        margin: '7px'
    };
    const sxInputBox = {
        backgroundColor: 'blue',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'end',
        justifyContent: 'flex-end'
    };
    const sxInputRow = {
        display: 'grid',
        gridTemplateColumns: '95px 75px 50px', 
        textAlign: 'right', 
        margin: '5px'
    };
    const sxValueTable = {
        display: 'flex', 
        flexDirection: 'column', 
        border: '1px solid black'
    };
    const sxValueTableHead = {
        textAlign: 'center', 
        backgroundColor: 'purple'
    };
    const sxValuesBox = {
        backgroundColor: 'green',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'end',
        justifyContent: 'flex-end',
        border: '1px solid black'
    };
    const sxValuesRow = {
        display: 'grid',
        gridTemplateColumns: '95px 95px',
        textAlign: 'right'
    };
    const sxValues = {
        fontWeight: 'bold',
        textDecoration: 'underline'
    };
    const sxVideo = {
        margin: '10px',
        border: '1px solid black',
        backgroundColor: 'white',
        width: '200px',
        height: '200px'
    }
     // Modem Case Id
     const RxCaseId = () => (
            <Typography sx={sxCaseId}>{RxData[0].unit}</Typography>
    )

    // Modem selector buttons
    const RxModemButtonBox = () => (
        <Box sx={sxModemButtonBox}>
            {RxData.map((x, index) => (
                <RxModemButton key={index} modem={x.number} />
            ))}
        </Box>
    );
    const RxModemButton = ({ modem }) => (
        <Button sx={sxModemButton}
        onClick={e => handleModemButtonClick(parseInt(e.target.innerText))}>
                {modem}
        </Button>
    );
    const handleModemButtonClick = ( modem ) => {
        console.log(modem)
    };

    // Modem User Inputs
    const RxModemInput = () => (
        <Box sx={sxInputBox}>
            <Box sx={sxInputRow}>
                <label htmlFor='antenna'>Antenna</label>
                <input name='antenna' type='text' value={RxData[0].id_antenna}></input>
            </Box>
            <Box sx={sxInputRow}>
                <label htmlFor='frequency'>Fequency</label>
                <input name='frequency' type='text' value={RxData[0].frequency}></input>
                <Typography>MHz</Typography>
            </Box>
            <Box sx={sxInputRow}>
                <label htmlFor='bandwidth'>Bandwidth</label>
                <input name='bandwidth' type='text' value={RxData[0].bandwidth}></input>
                <Typography>MHz</Typography>
            </Box>
            <Box sx={sxInputRow}>
                <label htmlFor='modulation'>Modulation</label>
                <input name='modulation' type='text' value={RxData[0].modulation}></input>
            </Box>
            <Box sx={sxInputRow}>
                <label htmlFor='fec'>FEC</label>
                <input name='fec' type='text' value={RxData[0].fec}></input>
            </Box>
            <Box sx={sxInputRow}>
                <div></div>
                <Button onClick={e => console.log(e.target.innerText)}>Apply</Button>
            </Box>
            
        </Box>
    );

    // Current Modem Values
    const RxModemValues = () => (
        <Box sx={sxValueTable}>
            <Typography sx={sxValueTableHead}>Current Values</Typography>
            <Box sx={sxValuesBox}>
                <Box sx={sxValuesRow}>
                    <Typography>Antenna: </Typography>
                    <Typography sx={sxValues}>{RxData[1].id_antenna}</Typography>
                </Box>
                <Box sx={sxValuesRow}>
                    <Typography>Frequency: </Typography>
                    <Typography sx={sxValues}>{`${RxData[1].frequency} MHz`}</Typography>
                </Box>
                <Box sx={sxValuesRow}>
                    <Typography>Bandwidth: </Typography>
                    <Typography sx={sxValues}>{`${RxData[1].bandwidth} MHz`}</Typography>
                </Box>
                <Box sx={sxValuesRow}>
                    <Typography>Modulation: </Typography>
                    <Typography sx={sxValues}>{RxData[1].modulation}</Typography>
                </Box>    
                <Box sx={sxValuesRow}>
                    <Typography>FEC: </Typography>
                    <Typography sx={sxValues}>{RxData[1].fec}</Typography>
                </Box>
            </Box>
        </Box>
    )
    
    const RxVideo = () => (
        <Box sx={sxVideo}>
            Video Goes Here
        </Box>
    )

    return(
        <>
                <Box sx={sxCase}>
                    <RxCaseId />
                    <RxModemButtonBox />
                    <RxModemValues />
                    <RxModemInput />
                    <RxVideo />
                </Box>
        </>
    )
}

RxModem.propTypes = {
    modem: PropTypes.integer
}