import { AstroTheme } from '../../themes/AstroTheme';

export const sxVideo = {
  position: 'relative',
  border: '8px solid transparent',
  borderImageSource: 'url(./bezel.png)',
  borderImageSlice: '30 fill',
  borderImageOutset: 0,
  overflow: 'hidden',
  boxShadow: '0px 0px 10px rgba(0,0,0,0.5)',
  backgroundColor: '#282a2b',
  borderRadius: '10px',
  color: AstroTheme.palette.tertiary.light3,
  // height: 'calc(100% - 36px)',
  width: 'calc(100% - 16px)',
  maxHeight: '200px',
  aspectRatio: '1/1',
};
