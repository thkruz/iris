import { AstroTheme } from '../../../../../../themes/AstroTheme';

export const sxRxModemButton = params => {
  const { isActive } = params;
  return {
    backgroundColor: isActive ? AstroTheme.palette.primary.dark : AstroTheme.palette.primary.light2,
    border: '2px solid ' + AstroTheme.palette.primary.main,
    color: isActive ? 'white' : 'black',
    minWidth: '36px',
    margin: '8px',
    outline: 'none',
    '&:hover': {
      backgroundColor: isActive ? AstroTheme.palette.primary.main : AstroTheme.palette.primary.light,
    },
  };
};
