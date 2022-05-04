import React from 'react';
import { Grid } from '@mui/material';
import { TxModem } from './TxModem/TxModem';
import { tmpTxData } from './tmpTxData';

//

// const Transmitter = () => {
//   return (
//     <Grid container item alignContent={'center'} spacing={1} xs={12}>
//       {[1, 2, 3, 4].map(x => (
//         <Grid key={x} item xs={12}>
//           <Box sx={{ backgroundColor: '#f5f5f5', textAlign: 'center' }}>
//             <h1>Transmitter Case {x}</h1>
//           </Box>
//         </Grid>
//       ))}
//     </Grid>
//   );
// };
function Transmitter() {
  const units = [1, 2, 3, 4];
  return units.map((x, index) => (
    <Grid key={index} item sx={{ margin: 'auto', padding: '5px' }} xs={12}>
      <TxModem unit={x} />
    </Grid>
  ));
}
export default Transmitter;
