import { ThemeOptions } from '@material-ui/core/styles/createMuiTheme';

export const AstroTheme = {
  palette: {
    type: 'dark',
    background: {
      default: '#101923',
      paper: '#1b2d3e',
    },
    primary: {
      main: '#005a8f',
      light: '#649cbd',
      dark: '#003655',
    },
    secondary: {
      main: '#4dacff',
      light: '#92cbff',
      dark: '#2b659b',
    },
    tertiary: {
      main: '#274059',
      light: '#7e8c9b',
      dark: '#172635',
    },
    error: {
      main: '#ffb302',
    },
    warning: {
      main: '#fce83a',
    },
    info: {
      main: '#2dccff',
    },
    success: {
      main: '#56f000',
    },
  },
  typography: {
    h1: {
      fontSize: '2.125rem',
      fontWeight: 400,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 400,
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
  },
};