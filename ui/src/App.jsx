import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { StudentStack, InstructorStack, Body, Header, Footer } from './components';
import Login from './components/Login/Login';

const App = () => {
  return (
    <Router>
      <Header />
      <Body>
        <Routes basename={`${process.env.PUBLIC_URL}/`}>
          <Route path='/' element={<Login />} />
          <Route path='/login' element={<Login />} />
          <Route path='/student' element={<StudentStack />} />
          <Route path='/instructor' element={<InstructorStack />} />
        </Routes>
      </Body>
      <Footer />
    </Router>
  );
};

export default App;
