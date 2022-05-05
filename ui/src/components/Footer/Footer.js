import React from 'react';
import { AstroTheme } from '../../themes/AstroTheme';

const footerStyle = {
  width: '100%',
  backgroundColor: AstroTheme.palette.tertiary.main,
};

const Footer = () => {
  return (
    <footer style={footerStyle}>
      <p>
        <center>{`That's a pretty sweet footer...`}</center>
      </p>
    </footer>
  );
};

export default Footer;
