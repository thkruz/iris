import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { io } from 'socket.io-client';

const txContext = React.createContext();
const updateTxContext = React.createContext();

const defaultTxContext = [
    {
        unit: 1,
        modem: 1,
        operational: true,
        id_antenna: 1,
        frequency: 1000,
        bandwidth: 10,
        power: -70, transmitting: false
    },
    {
        unit: 1,
        modem: 2,
        operational: true,
        id_antenna: 1,
        frequency: 1000,
        bandwidth: 10,
        power: -70, transmitting: false
    },
    {
        unit: 1,
        modem: 3,
        operational: true,
        id_antenna: 1,
        frequency: 1000,
        bandwidth: 10,
        power: -70, transmitting: false
    },
    {
        unit: 1,
        modem: 4,
        operational: true,
        id_antenna: 1,
        frequency: 1000,
        bandwidth: 10,
        power: -70, transmitting: false
    },
    {
        unit: 2,
        modem: 1,
        operational: true,
        id_antenna: 1,
        frequency: 1000,
        bandwidth: 10,
        power: -70, transmitting: false
    },
    {
        unit: 2,
        modem: 2,
        operational: true,
        id_antenna: 1,
        frequency: 1000,
        bandwidth: 10,
        power: -70, transmitting: false
    },
    {
        unit: 2,
        modem: 3,
        operational: true,
        id_antenna: 1,
        frequency: 1000,
        bandwidth: 10,
        power: -70, transmitting: false
    },
    {
        unit: 2,
        modem: 4,
        operational: true,
        id_antenna: 1,
        frequency: 1000,
        bandwidth: 10,
        power: -70, transmitting: false
    },
    {
        unit: 3,
        modem: 1,
        operational: true,
        id_antenna: 1,
        frequency: 1000,
        bandwidth: 10,
        power: -70, transmitting: false
    },
    {
        unit: 3,
        modem: 2,
        operational: true,
        id_antenna: 1,
        frequency: 1000,
        bandwidth: 10,
        power: -70, transmitting: false
    },
    {
        unit: 3,
        modem: 3,
        operational: true,
        id_antenna: 1,
        frequency: 1000,
        bandwidth: 10,
        power: -70, transmitting: false
    },
    {
        unit: 3,
        modem: 4,
        operational: true,
        id_antenna: 1,
        frequency: 1000,
        bandwidth: 10,
        power: -70, transmitting: false
    },
    {
        unit: 4,
        modem: 1,
        operational: true,
        id_antenna: 1,
        frequency: 1000,
        bandwidth: 10,
        power: -70, transmitting: false
    },
    {
        unit: 4,
        modem: 2,
        operational: true,
        id_antenna: 1,
        frequency: 1000,
        bandwidth: 10,
        power: -70, transmitting: false
    },
    {
        unit: 4,
        modem: 3,
        operational: true,
        id_antenna: 1,
        frequency: 1000,
        bandwidth: 10,
        power: -70, transmitting: false
    },
    {
        unit: 4,
        modem: 4,
        operational: true,
        id_antenna: 1,
        frequency: 1000,
        bandwidth: 10,
        power: -70, transmitting: false
    },
];

export const useTx = () => {
    return useContext(txContext);
};

const socket = io('http://localhost:8080', {transports: ['websocket']}); // this doesn't belong here, I'm just not sure where to put it lol
socket.on('update', (updated_context) => {
    console.log(tx);
    setTx(updated_context);
});

export const useUpdateTx = () => {
    return useContext(updateTxContext);
};

export const TxProvider = ({ children }) => {

    const [tx, setTx] = useState(defaultTxContext);
    const updateTx = (update) => {
        console.log("updateTx");
        // if same
        //    don't broadcast

        //  patch request to update database
        // if patch request is good
        //      socket.emit('update', update);
        socket.emit('update', update);
        setTx(update);
    };

    return (
        <txContext.Provider value={tx}>
            <updateTxContext.Provider value={updateTx}>
                {children}
            </updateTxContext.Provider>
        </txContext.Provider>
    )
}

TxProvider.propTypes = {
    children: PropTypes.any
}