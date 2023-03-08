//import { ThemeOptions } from '@material-ui/core/styles/createMuiTheme';
import '@astrouxds/tokens/dist/css/index.css'

export const AstroTheme = {
  palette: {
    type: 'dark',
    background: {
      default: 'var(--color-background-base-default)',
      paper: 'var(--color-background-surface-default)',
    },
    primary: {
      main: '#005a8f',
      light: '#2f7aa7',
      light2: '#649cbd',
      light3: '#98bdd3',
      light4: '#cbdee9',
      dark: '#004872',
      dark2: '#003655',
      dark3: '#002439',
      dark4: '#00121c',
    },
    secondary: {
      main: '#4dacff',
      light: '#92cbff',
      dark: '#2b659b',
    },
    tertiary: {
      main: '#274059',
      light: '#52667a',
      light2: '#7e8c9b',
      light3: '#a9b2bc',
      light4: '#d4d8dd',
      dark: '#1f3347',
      dark2: '#172635',
      dark3: '#101923',
      dark4: '#080c11',
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
    critical: {
      main: '#ff3838',
    },
    serious: {
      main: '#ffb302',
    },
    caution: {
      main: '#fce83a',
    },
    normal: {
      main: '#56f000',
    },
    standby: {
      main: '#2dccff',
    },
    disabled: {
      main: '#9ea7ad',
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
