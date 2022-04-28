//import { ThemeOptions } from '@material-ui/core/styles/createMuiTheme';

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
      Lighten1: 'rgb(253, 237, 97)',
      Lighten2: 'rgb(253, 241, 137)',
      Lighten3: 'rgb(254, 246, 176)',
      Lighten4: 'rgb(254, 250, 216)',
      Darken1: 'rgb(202, 186, 46)',
      Darken2: 'rgb(151, 139, 35)',
      Darken3: 'rgb(101, 93, 23)',
      Darken4: 'rgb(50, 46, 12)',
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
