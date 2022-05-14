import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  let staticUserName = 'admin';
  let staticUserPassword = 'admin';
  let staticStudentUserName = 'student';
  let staticStudentUserPassword = 'student';

  const handleSubmit = event => {
    event.preventDefault();
    if (userName === staticUserName && password === staticUserPassword) {
      navigate('/instructor', { state: { isAuthenticated: true } });
    } else if (userName === staticStudentUserName && password === staticStudentUserPassword) {
      navigate('/student', { state: { isAuthenticated: true } });
    } else {
      alert('Invalid username or password');
    }
  };

  return (
    <Box
      component='form'
      textAlign={'center'}
      justifyContent={'center'}
      onSubmit={handleSubmit}
      bgcolor='background.paper'
      sx={{
        '& > :not(style)': { m: 1, width: '25ch' },
      }}
      novalidate
      autocomplete='off'>
      <TextField
        value={userName}
        onInput={e => setUserName(e.target.value)}
        id='login-username'
        label='Login'
        variant='outlined'
      />
      <TextField
        value={password}
        onInput={e => setPassword(e.target.value)}
        id='login-password'
        label='Password'
        variant='outlined'
        type='password'
      />
      <Button type='submit' size='large' variant='contained' color='primary'>
        Submit
      </Button>
    </Box>
  );
}
