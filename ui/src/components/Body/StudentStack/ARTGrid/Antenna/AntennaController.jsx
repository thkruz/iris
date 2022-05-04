import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Button } from '@mui/material';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore'
import CellTowerIcon from '@mui/icons-material/CellTower'
import AlignHorizontalCenterIcon from '@mui/icons-material/AlignHorizontalCenter'
import { AstroTheme } from '../../../../../themes/AstroTheme';
import { useAntenna, useUpdateAntenna } from '../../../../../context'; 
import './Antenna.css'

export const AntennaController = ({ unit }) => {
    const theme = AstroTheme;
    const antennaData = useAntenna();
    const setAntennaData = useUpdateAntenna();
    const bands = [
        {id: 1, name: 'C', ul: 3350, dl: 3500}, 
        {id: 2, name: 'Ku', ul: 14100, dl: 14250}
        ];
    const targets = [
        {id: 1, name: 'ARKE 3G', offset: 400},
        {id: 2, name: 'AURORA 2B', offset: 450},
        {id: 3, name: 'AUXO STAR', offset: 420},
        {id: 4, name: 'ENYO', offset: 300},
        {id: 5, name: 'HASHCOMM 7', offset: 365},
        {id: 6, name: 'HUF UHF FO', offset: 210},
        {id: 7, name: 'MERCURY PAWN', offset: 150},
        {id: 8, name: 'NYXSAT', offset: 250},
        {id: 9, name: 'RASCAL', offset: 120},
        {id: 10, name: 'WILL 1-AM', offset: 345}
    ]
    // Styles
    const sxAntennaCase = {
        flexGrow: 1,
        margin: 'auto',
        backgroundColor: theme.palette.primary.main,
        borderRadius: '10px',
        border: '1px solid black',
        display: 'grid',
        gridTemplateColumns: '1fr 6fr 12fr',
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
        backgroundColor: theme.palette.primary.main,
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
        backgroundColor: theme.palette.primary.light,
        boxShadow: '0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19)',
        color: 'black',
        margin: '8px',
        cursor: 'pointer',
    };
    const sxLoopback = {
        width: '100px',
        padding: '8px',
        borderRadius: '5px',
        backgroundColor: theme.palette.primary.light,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19)',
    };
    const sxLoopbackSwitch = {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    };
    const sxHPA = {
        marginTop: '5px',
        backgroundColor: antennaData[unit-1].hpa ? 'red' : theme.palette.primary.dark,
        color: antennaData[unit-1].hpa ? 'black' : 'white',
        boxShadow: '0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19)',
    };

    // Modem Case Id
    const sidebar = [];
    ['A', 'N', 'T',].forEach((x, index) => {
        sidebar.push(
            <Typography key={index} sx={{ color: 'black' }}>
                {x}
            </Typography>,
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
        const [inputData, setInputData] = useState(antennaData[unit-1])
        const handleInputChange = ({ param, val }) => {
            const tmpInputData = {...inputData};
            tmpInputData[param] = parseInt(val);
            setInputData(tmpInputData);
        }
        const handleApply = () => {
            const tmpData = [...antennaData]
            tmpData[unit-1] = inputData
            setAntennaData(tmpData)
        }
        return (
            <Box sx={sxInputBox}>
                <Box sx={sxInputRow}>
                    <label htmlFor="Target">Target</label>
                    <select
                    name="Target"
                    value={inputData.id_target}
                    onChange={e => handleInputChange({param: 'id_target', val:e.target.value})}
                    >
                    {targets.map((x, index) => {return(<option value={x.id} key={index}>{x.name}</option>)})}
                    </select>
                    <Typography sx={sxValues}>
                    {targets[antennaData[unit-1].id_target-1].name}
                    </Typography>
                </Box>
                <Box sx={sxInputRow}>
                    <label htmlFor="Band">Band</label>
                    <select
                    name="band"
                    value={inputData.band}
                    onChange={e => handleInputChange({param: 'band', val: e.target.value})}
                    >
                    {bands.map((x, index) => {return(<option value={x.id} key={index}>{x.name}</option>)})}
                    </select>
                    <Typography sx={sxValues}>
                    {bands[antennaData[unit-1].band-1].name}
                    </Typography>
                </Box>
                <Box sx={sxInputRow}>
                    <label htmlFor="offset">Offset</label>
                    <input
                    name="offset"
                    type="text"
                    value={inputData.offset}
                    onChange={e => {handleInputChange({param: 'offset', val: parseInt(e.target.value)})}}
                    ></input>
                    <Typography sx={sxValues}>
                    {antennaData[unit-1].offset + ' MHz'}
                    </Typography>
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
            const tmpData = [...antennaData]
            const loopback = tmpData[unit-1].loopback
            tmpData[unit-1].loopback = !loopback
            setAntennaData(tmpData)
        }; 
        const handleHPA = () => {
            const tmpData = [...antennaData];
            const hpa = tmpData[unit-1].hpa;
            tmpData[unit-1].hpa = !hpa;
            setAntennaData(tmpData)
        };
        return(
        <Box sx={sxLoopback}>
            <Typography align='center'>IF</Typography>
            <Box sx={sxLoopbackSwitch}>
                <SettingsBackupRestoreIcon />
                <center>
                    <img className='lb_img'
                        src={`baseball_switch${antennaData[unit-1].loopback ? '2' : ''}.png`} 
                        alt='baseball_switch' 
                        onClick={e => toggleSwitch(e)}/>
                    </center>
                <CellTowerIcon />
            </Box>
            <AlignHorizontalCenterIcon/>
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
