import { AstroTheme } from '../../themes/AstroTheme';

export const sxModalError = {
  position: 'fixed',
  zIndex: '100',
  top: '0%',
  left: '50%',
  transform: 'translate(-50%, 10%)',
  bgcolor: AstroTheme.palette.critical.main,
  color: '#fff',
  border: `5px solid ${AstroTheme.palette.critical.main}`,
  borderRadius: '0px',
  boxShadow: 24,
  maxWidth: '50%',
  minWidth: '30%',
  p: 2,
};
