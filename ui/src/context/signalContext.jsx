import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
const signalContext = React.createContext();
const updateSignalContext = React.createContext();

const defaultSignalContext = [
    {id: 1, server_id: 1, target_id: 1, frequency: 4710, power: -45, bandwidth: 5, modulation: '8QAM', fec: '1/2', feed:'red 1.mp4', operational: 'false'},
    {id: 2, server_id: 1, target_id: 1, frequency: 4720, power: -50, bandwidth: 3, modulation: '8QAM', fec: '3/4', feed:'red 2.mp4', operational: 'false'},
    {id: 3, server_id: 1, target_id: 1, frequency: 4745, power: -48, bandwidth: 1, modulation: '8QAM', fec: '3/4', feed:'red 3.mp4', operational: 'false'},
    {id: 4, server_id: 1, target_id: 1, frequency: 5115, power: -46, bandwidth: 10, modulation: '8QAM', fec: '1/2', feed:'red 4.mp4', operational: 'false'},
    {id: 5, server_id: 1, target_id: 1, frequency: 5130, power: -45, bandwidth: 6, modulation: '8QAM', fec: '3/4', feed:'red 5.mp4', operational: 'false'},
    {id: 6, server_id: 1, target_id: 2, frequency: 15710, power: -45, bandwidth: 5, modulation: '8QAM', fec: '3/4', feed:'red 6.mp4', operational: 'false'},
    {id: 7, server_id: 1, target_id: 2, frequency: 15718, power: -47, bandwidth: 1, modulation: '8QAM', fec: '1/2', feed:'red 7.mp4', operational: 'false'},
    {id: 8, server_id: 1, target_id: 2, frequency: 15720, power: -47, bandwidth: 1, modulation: '8QAM', fec: '3/4', feed:'red 8.mp4', operational: 'false'},
    {id: 9, server_id: 1, target_id: 2, frequency: 15722, power: -46, bandwidth: 1, modulation: '8QAM', fec: '3/4', feed:'red 9.mp4', operational: 'false'},
    {id: 10, server_id: 1, target_id: 3, frequency: 16135, power: -50, bandwidth: 2, modulation: '8QAM', fec: '1/2', feed:'blue 1.mp4', operational: 'false'},
    {id: 11, server_id: 1, target_id: 3, frequency: 16140, power: -45, bandwidth: 6, modulation: '8QAM', fec: '1/2', feed:'blue 2.mp4', operational: 'false'},
    {id: 12, server_id: 1, target_id: 3, frequency: 15720, power: -52, bandwidth: 10, modulation: '8QAM', fec: '3/4', feed:'red 1.mp4', operational: 'false'},
    {id: 13, server_id: 1, target_id: 3, frequency: 15730, power: -48, bandwidth: 1, modulation: '8QAM', fec: '3/4', feed:'red 2.mp4', operational: 'false'}
]

export const useSignal = () => {
    return useContext(signalContext);
};

export const useUpdateSignal = () => {
    return useContext(updateSignalContext);
};

export const SignalProvider = ({ children }) => {
    const [signal, setSignal] = useState(defaultSignalContext);
    const updateSignal = (update) => {
        setSignal(update);
    };

    return (
        <signalContext.Provider value={signal}>
            <updateSignalContext.Provider value={updateSignal}>
                {children}
            </updateSignalContext.Provider>
        </signalContext.Provider>
    )
}

SignalProvider.propTypes = {
    children: PropTypes.any
}