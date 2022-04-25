import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Stack, Typography } from '@mui/material';

export const RxModem = () => {
    const ModemButtonSx = {display: 'flex', flexDirection: 'column'}

    // Modem selector buttons
    const handleModemButtonClick = ( modem ) => {
        console.log(modem)
    }
    const RxModemButton = ({ modem }) => (
        <Button sx = {{
            backgroundColor: 'red', 
            border: '1px solid black', 
            width: '1em'}}
            onClick={e => handleModemButtonClick(parseInt(e.target.innerText))}>
                {modem}
        </Button>
    )
    const RxModemButtonStack = () => (
        <Box
            sx={ModemButtonSx}>
            {RxData.map((x, index) => (
                <RxModemButton key={index} modem={x.number} />
            ))}
        </Box>
    )


    // Modem Case Id
    const RxCaseId = () => (
        <Box sx={{
            transform: 'rotate(-90deg)',
            height: '30px',
            width: '100px',
            textAlign: 'center',
        }}>
            <Typography>Rx Case {RxData[0].unit}</Typography>
        </Box>
    )

    // Modem User Inputs
    const RxModemInput = () => (
        <Stack sx={{
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div>
                <label htmlFor='antenna'>Antenna</label>
                <input name='antenna' type='text' value='1'></input>
            </div>
            <div>
                <label htmlFor='frequency'>Fequency</label>
                <input name='frequency' type='text' value='1'></input>
            </div>
            <div>
                <label htmlFor='bandwidth'>Bandwidth</label>
                <input name='bandwidth' type='text' value='1'></input>
            </div>
            <div>
                <label htmlFor='modulation'>Modulation</label>
                <input name='modulation' type='text' value='1'></input>
            </div>
            <div>
                <label htmlFor='fec'>FEC</label>
                <input name='fec' type='text' value='1'></input>
            </div>
            <Button onClick={e => console.log(e.target.innerText)}>Apply</Button>
        </Stack>
    )


    const RxData = [{unit: 1, number: 1, operational: true, id_antenna: 1, frequency: 1100, bandwidth: 25, modulation: '8PSK', fec: '3/5'},
                    {unit: 1, number: 2, operational: true, id_antenna: 1, frequency: 1200, bandwidth: 35, modulation: 'BPSK', fec: '1/2'},
                    {unit: 1, number: 3, operational: true, id_antenna: 1, frequency: 1300, bandwidth: 45, modulation: 'QPSK', fec: '3/4'},
                    {unit: 1, number: 4, operational: true, id_antenna: 1, frequency: 1400, bandwidth: 55, modulation: '16PSK', fec: '1/2'}]

    return(
        <>
            <Box
                sx={{
                    flexGrow: 1,
                    backgroundColor: 'gray'
                }}>
                <Box>
                    <Typography>
                        Receiver Modem
                    </Typography>
                </Box>
                <Stack sx={{ display:'flex', flexDirection: 'row' , alignItems: 'center'}}>
                    <RxCaseId />
                    <RxModemButtonStack />
                    <RxModemInput />
                </Stack>
                
                
            </Box>
        </>
    )
}

RxModem.propTypes = {
    modem: PropTypes.integer
}