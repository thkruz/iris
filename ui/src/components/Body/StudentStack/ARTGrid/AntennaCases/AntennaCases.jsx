import React from 'react';
import { AntennaCase } from './AntennaCase';

export const AntennaCases = () => {
  return (
    <>
      {[1, 2].map(unit => (
        <AntennaCase key={unit} unit={unit} />
      ))}
    </>
  );
};
