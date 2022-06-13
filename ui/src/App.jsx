import { createTheme, ThemeProvider } from '@mui/material';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { StudentStack, InstructorStack, Body, Header, Footer } from './components';
import Login from './components/Login/Login';
import { AstroTheme } from './themes/AstroTheme';

const App = () => {
  return (
    <ThemeProvider theme={createTheme(AstroTheme)}>
      <Router basename={`${process.env.PUBLIC_URL}/`}>
        <Header />
        <Body>
          <Routes>
            <Route path='/' element={<Login />} />
            <Route path='/login' element={<Login />} />
            <Route path='/student' element={<StudentStack />} />
            <Route path='/instructor' element={<InstructorStack />} />
            <Route path='*' element={<Login />} />
          </Routes>
        </Body>
        <Footer />
      </Router>
    </ThemeProvider>
  );
};

export default App;
