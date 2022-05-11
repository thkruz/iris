import React from 'react';
//import { Typography } from '@mui/material';
//import { useTx } from '../../../../../context';
//import { AstroTheme } from '../../../../../themes/AstroTheme';

export const Equipment = () => {
    /*
    const tmpReceiver = [
        
    ];
    const tmpTransmitter = [
        {id: 1, id_server: 1, id_team: 1, unit: 1, number: 1, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 2, id_server: 1, id_team: 1, unit: 1, number: 2, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 3, id_server: 1, id_team: 1, unit: 1, number: 3, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 4, id_server: 1, id_team: 1, unit: 1, number: 4, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 5, id_server: 1, id_team: 1, unit: 2, number: 1, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 6, id_server: 1, id_team: 1, unit: 2, number: 2, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 7, id_server: 1, id_team: 1, unit: 2, number: 3, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 8, id_server: 1, id_team: 1, unit: 2, number: 4, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 9, id_server: 1, id_team: 1, unit: 3, number: 1, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 10, id_server: 1, id_team: 1, unit: 3, number: 2, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 11, id_server: 1, id_team: 1, unit: 3, number: 3, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 12, id_server: 1, id_team: 1, unit: 3, number: 4, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 13, id_server: 1, id_team: 1, unit: 4, number: 1, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 14, id_server: 1, id_team: 1, unit: 4, number: 2, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 15, id_server: 1, id_team: 1, unit: 4, number: 3, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 16, id_server: 1, id_team: 1, unit: 4, number: 4, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 17, id_server: 1, id_team: 2, unit: 1, number: 1, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 18, id_server: 1, id_team: 2, unit: 1, number: 2, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 19, id_server: 1, id_team: 2, unit: 1, number: 3, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 20, id_server: 1, id_team: 2, unit: 1, number: 4, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 21, id_server: 1, id_team: 2, unit: 2, number: 1, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 22, id_server: 1, id_team: 2, unit: 2, number: 2, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 23, id_server: 1, id_team: 2, unit: 2, number: 3, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 24, id_server: 1, id_team: 2, unit: 2, number: 4, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 25, id_server: 1, id_team: 2, unit: 3, number: 1, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 26, id_server: 1, id_team: 2, unit: 3, number: 2, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 27, id_server: 1, id_team: 2, unit: 3, number: 3, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 28, id_server: 1, id_team: 2, unit: 3, number: 4, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 29, id_server: 1, id_team: 2, unit: 4, number: 1, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 30, id_server: 1, id_team: 2, unit: 4, number: 2, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 31, id_server: 1, id_team: 2, unit: 4, number: 3, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 32, id_server: 1, id_team: 2, unit: 4, number: 4, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 33, id_server: 1, id_team: 3, unit: 1, number: 1, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 34, id_server: 1, id_team: 3, unit: 1, number: 2, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 35, id_server: 1, id_team: 3, unit: 1, number: 3, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 36, id_server: 1, id_team: 3, unit: 1, number: 4, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 37, id_server: 1, id_team: 3, unit: 2, number: 1, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 38, id_server: 1, id_team: 3, unit: 2, number: 2, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 39, id_server: 1, id_team: 3, unit: 2, number: 3, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 40, id_server: 1, id_team: 3, unit: 2, number: 4, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 41, id_server: 1, id_team: 3, unit: 3, number: 1, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 42, id_server: 1, id_team: 3, unit: 3, number: 2, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 43, id_server: 1, id_team: 3, unit: 3, number: 3, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 44, id_server: 1, id_team: 3, unit: 3, number: 4, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 45, id_server: 1, id_team: 3, unit: 4, number: 1, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 46, id_server: 1, id_team: 3, unit: 4, number: 2, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 47, id_server: 1, id_team: 3, unit: 4, number: 3, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 48, id_server: 1, id_team: 3, unit: 4, number: 4, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 49, id_server: 1, id_team: 4, unit: 1, number: 1, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 50, id_server: 1, id_team: 4, unit: 1, number: 2, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 51, id_server: 1, id_team: 4, unit: 1, number: 3, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 52, id_server: 1, id_team: 4, unit: 1, number: 4, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 53, id_server: 1, id_team: 4, unit: 2, number: 1, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 54, id_server: 1, id_team: 4, unit: 2, number: 2, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 55, id_server: 1, id_team: 4, unit: 2, number: 3, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 56, id_server: 1, id_team: 4, unit: 2, number: 4, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 57, id_server: 1, id_team: 4, unit: 3, number: 1, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 58, id_server: 1, id_team: 4, unit: 3, number: 2, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 59, id_server: 1, id_team: 4, unit: 3, number: 3, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 60, id_server: 1, id_team: 4, unit: 3, number: 4, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 61, id_server: 1, id_team: 4, unit: 4, number: 1, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 62, id_server: 1, id_team: 4, unit: 4, number: 2, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 63, id_server: 1, id_team: 4, unit: 4, number: 3, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false},
        {id: 64, id_server: 1, id_team: 4, unit: 4, number: 4, operational: true, id_antenna: 1, freqency: 1250, bandwidth: 10, power: -40, transmitting: false}
    ];
    const tmpSpecA = [
        {id: 1, id_server: 1, id_team: 1, unit: 1, number: 1, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
        {id: 2, id_server: 1, id_team: 1, unit: 1, number: 2, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
        {id: 3, id_server: 1, id_team: 1, unit: 2, number: 1, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
        {id: 4, id_server: 1, id_team: 1, unit: 2, number: 2, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
        {id: 5, id_server: 1, id_team: 1, unit: 3, number: 1, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
        {id: 6, id_server: 1, id_team: 1, unit: 3, number: 2, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
        {id: 7, id_server: 1, id_team: 1, unit: 4, number: 1, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
        {id: 8, id_server: 1, id_team: 1, unit: 4, number: 2, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
        {id: 9, id_server: 1, id_team: 2, unit: 1, number: 1, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
        {id: 10, id_server: 1, id_team: 2, unit: 1, number: 2, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
        {id: 11, id_server: 1, id_team: 2, unit: 2, number: 1, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
        {id: 12, id_server: 1, id_team: 2, unit: 2, number: 2, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
        {id: 13, id_server: 1, id_team: 2, unit: 3, number: 1, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
        {id: 14, id_server: 1, id_team: 2, unit: 3, number: 2, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
        {id: 15, id_server: 1, id_team: 2, unit: 4, number: 1, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
        {id: 16, id_server: 1, id_team: 2, unit: 4, number: 2, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
        {id: 17, id_server: 1, id_team: 3, unit: 1, number: 1, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
        {id: 18, id_server: 1, id_team: 3, unit: 1, number: 2, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
        {id: 19, id_server: 1, id_team: 3, unit: 2, number: 1, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
        {id: 20, id_server: 1, id_team: 3, unit: 2, number: 2, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
        {id: 21, id_server: 1, id_team: 3, unit: 3, number: 1, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
        {id: 22, id_server: 1, id_team: 3, unit: 3, number: 2, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
        {id: 23, id_server: 1, id_team: 3, unit: 4, number: 1, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
        {id: 24, id_server: 1, id_team: 3, unit: 4, number: 2, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
        {id: 25, id_server: 1, id_team: 4, unit: 1, number: 1, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
        {id: 26, id_server: 1, id_team: 4, unit: 1, number: 2, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
        {id: 27, id_server: 1, id_team: 4, unit: 2, number: 1, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
        {id: 28, id_server: 1, id_team: 4, unit: 2, number: 2, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
        {id: 29, id_server: 1, id_team: 4, unit: 3, number: 1, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
        {id: 30, id_server: 1, id_team: 4, unit: 3, number: 2, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
        {id: 31, id_server: 1, id_team: 4, unit: 4, number: 1, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
        {id: 32, id_server: 1, id_team: 4, unit: 4, number: 2, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
    ]
    
    const tmpAntenna = [
        {id: 1, id_server: 1, id_team: 1, unit: 1, operational: true, id_target: 1, lock: true, band: 'C', offset: 400, hpa: false, loopback: true},
        {id: 2, id_server: 1, id_team: 1, unit: 2, operational: true, id_target: 1, lock: true, band: 'C', offset: 400, hpa: false, loopback: true},
        {id: 3, id_server: 1, id_team: 2, unit: 1, operational: true, id_target: 1, lock: true, band: 'C', offset: 400, hpa: false, loopback: true},
        {id: 4, id_server: 1, id_team: 2, unit: 2, operational: true, id_target: 1, lock: true, band: 'C', offset: 400, hpa: false, loopback: true},
        {id: 5, id_server: 1, id_team: 3, unit: 1, operational: true, id_target: 1, lock: true, band: 'C', offset: 400, hpa: false, loopback: true},
        {id: 6, id_server: 1, id_team: 3, unit: 2, operational: true, id_target: 1, lock: true, band: 'C', offset: 400, hpa: false, loopback: true},
        {id: 7, id_server: 1, id_team: 4, unit: 1, operational: true, id_target: 1, lock: true, band: 'C', offset: 400, hpa: false, loopback: true},
        {id: 8, id_server: 1, id_team: 5, unit: 2, operational: true, id_target: 1, lock: true, band: 'C', offset: 400, hpa: false, loopback: true},
    ]

    const tmpRxOps = [
        {id: 1, id_server: 1, id_team: 1, unit: 1, operational: true},
        {id: 2, id_server: 1, id_team: 1, unit: 2, operational: true},
        {id: 3, id_server: 1, id_team: 1, unit: 3, operational: true},
        {id: 4, id_server: 1, id_team: 1, unit: 4, operational: true},
        {id: 5, id_server: 1, id_team: 2, unit: 1, operational: true},
        {id: 6, id_server: 1, id_team: 2, unit: 2, operational: true},
        {id: 7, id_server: 1, id_team: 2, unit: 3, operational: true},
        {id: 8, id_server: 1, id_team: 2, unit: 4, operational: true},
        {id: 9, id_server: 1, id_team: 3, unit: 1, operational: true},
        {id: 10, id_server: 1, id_team: 3, unit: 2, operational: true},
        {id: 11, id_server: 1, id_team: 3, unit: 3, operational: true},
        {id: 12, id_server: 1, id_team: 3, unit: 4, operational: true},
        {id: 13, id_server: 1, id_team: 4, unit: 1, operational: true},
        {id: 14, id_server: 1, id_team: 4, unit: 2, operational: true},
        {id: 15, id_server: 1, id_team: 4, unit: 3, operational: true},
        {id: 16, id_server: 1, id_team: 4, unit: 4, operational: true}
    ];

    const tmpTxOps = [
        {id: 1, id_server: 1, id_team: 1, unit: 1, operational: true},
        {id: 2, id_server: 1, id_team: 1, unit: 2, operational: true},
        {id: 3, id_server: 1, id_team: 1, unit: 3, operational: true},
        {id: 4, id_server: 1, id_team: 1, unit: 4, operational: true},
        {id: 5, id_server: 1, id_team: 2, unit: 1, operational: true},
        {id: 6, id_server: 1, id_team: 2, unit: 2, operational: true},
        {id: 7, id_server: 1, id_team: 2, unit: 3, operational: true},
        {id: 8, id_server: 1, id_team: 2, unit: 4, operational: true},
        {id: 9, id_server: 1, id_team: 3, unit: 1, operational: true},
        {id: 10, id_server: 1, id_team: 3, unit: 2, operational: true},
        {id: 11, id_server: 1, id_team: 3, unit: 3, operational: true},
        {id: 12, id_server: 1, id_team: 3, unit: 4, operational: true},
        {id: 13, id_server: 1, id_team: 4, unit: 1, operational: true},
        {id: 14, id_server: 1, id_team: 4, unit: 2, operational: true},
        {id: 15, id_server: 1, id_team: 4, unit: 3, operational: true},
        {id: 16, id_server: 1, id_team: 4, unit: 4, operational: true}
    ];
    const tmpTeams
    const txData = useTx();
    //const theme = AstroTheme;
*/
    return (
        <>
            {}
        </>
    );
};