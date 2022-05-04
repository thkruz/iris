import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
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

export const useUpdateTx = () => {
    return useContext(updateTxContext);
};

export const TxProvider = ({ children }) => {
    const [tx, setTx] = useState(defaultTxContext);
    const updateTx = (update) => {
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