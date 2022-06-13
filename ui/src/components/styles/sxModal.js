import { AstroTheme } from '../../themes/AstroTheme';

export const sxModal = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: AstroTheme.palette.tertiary.dark,
  color: '#000',
  border: `5px solid ${AstroTheme.palette.tertiary.dark2}`,
  borderRadius: '5px',
  boxShadow: 24,
  p: 4,
};
