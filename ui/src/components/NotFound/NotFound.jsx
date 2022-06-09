import React from 'react';
import { useLocation } from 'react-router-dom';

const NotFound = () => {
  const location = useLocation();

  return (
    <div className='not-found'>
      <h1>404</h1>
      <p>Page not found</p>
      <p>{location.pathname}</p>
    </div>
  );
};

export default NotFound;
