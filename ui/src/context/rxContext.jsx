import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
const rxContext = React.createContext();
const updateRxContext = React.createContext();

const defaultRxContext = [
    {
        unit: 1,
        modem: 1,
        operational: true,
        id_antenna: 1,
        frequency: 1000,
        bandwidth: 10,
        modulation: 'BPSK',
        fec: '1/2',
    },
    {
        unit: 1,
        modem: 2,
        operational: true,
        id_antenna: 1,
        frequency: 1000,
        bandwidth: 10,
        modulation: 'BPSK',
        fec: '1/2',
    },
    {
        unit: 1,
        modem: 3,
        operational: true,
        id_antenna: 1,
        frequency: 1000,
        bandwidth: 10,
        modulation: 'BPSK',
        fec: '1/2',
    },
    {
        unit: 1,
        modem: 4,
        operational: true,
        id_antenna: 1,
        frequency: 1000,
        bandwidth: 10,
        modulation: 'BPSK',
        fec: '1/2',
    },
    {
        unit: 2,
        modem: 1,
        operational: true,
        id_antenna: 1,
        frequency: 1000,
        bandwidth: 10,
        modulation: 'BPSK',
        fec: '1/2',
    },
    {
        unit: 2,
        modem: 2,
        operational: true,
        id_antenna: 1,
        frequency: 1000,
        bandwidth: 10,
        modulation: 'BPSK',
        fec: '1/2',
    },
    {
        unit: 2,
        modem: 3,
        operational: true,
        id_antenna: 1,
        frequency: 1000,
        bandwidth: 10,
        modulation: 'BPSK',
        fec: '1/2',
    },
    {
        unit: 2,
        modem: 4,
        operational: true,
        id_antenna: 1,
        frequency: 1000,
        bandwidth: 10,
        modulation: 'BPSK',
        fec: '1/2',
    },
    {
        unit: 3,
        modem: 1,
        operational: true,
        id_antenna: 1,
        frequency: 1000,
        bandwidth: 10,
        modulation: 'BPSK',
        fec: '1/2',
    },
    {
        unit: 3,
        modem: 2,
        operational: true,
        id_antenna: 1,
        frequency: 1000,
        bandwidth: 10,
        modulation: 'BPSK',
        fec: '1/2',
    },
    {
        unit: 3,
        modem: 3,
        operational: true,
        id_antenna: 1,
        frequency: 1000,
        bandwidth: 10,
        modulation: 'BPSK',
        fec: '1/2',
    },
    {
        unit: 3,
        modem: 4,
        operational: true,
        id_antenna: 1,
        frequency: 1000,
        bandwidth: 10,
        modulation: 'BPSK',
        fec: '1/2',
    },
    {
        unit: 4,
        modem: 1,
        operational: true,
        id_antenna: 1,
        frequency: 1000,
        bandwidth: 10,
        modulation: 'BPSK',
        fec: '1/2',
    },
    {
        unit: 4,
        modem: 2,
        operational: true,
        id_antenna: 1,
        frequency: 1000,
        bandwidth: 10,
        modulation: 'BPSK',
        fec: '1/2',
    },
    {
        unit: 4,
        modem: 3,
        operational: true,
        id_antenna: 1,
        frequency: 1000,
        bandwidth: 10,
        modulation: 'BPSK',
        fec: '1/2',
    },
    {
        unit: 4,
        modem: 4,
        operational: true,
        id_antenna: 1,
        frequency: 1000,
        bandwidth: 10,
        modulation: 'BPSK',
        fec: '1/2',
    },
];

export const useRx = () => {
    return useContext(rxContext);
};

export const useUpdateRx = () => {
    return useContext(updateRxContext);
};

export const RxProvider = ({ children }) => {
    const [rx, setRx] = useState(defaultRxContext);
    const updateRx = (update) => {
        setRx(update);
    };

    return (
        <rxContext.Provider value={rx}>
            <updateRxContext.Provider value={updateRx}>
                {children}
            </updateRxContext.Provider>
        </rxContext.Provider>
    )
}

RxProvider.propTypes = {
    children: PropTypes.any
}