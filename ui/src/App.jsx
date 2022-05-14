import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { StudentStack, InstructorStack, Body, Header, Footer } from './components';
import Login from './components/Login/Login';

// const ApiUrl = config[process.env.REACT_APP_NODE_ENV || 'development'].apiUrl;

const App = () => {
  return (
    <Router>
      <Header />
      <Body>
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='login' element={<Login />} />
          <Route path='/student' element={<StudentStack />} />
          <Route path='/instructor' element={<InstructorStack />} />
        </Routes>
      </Body>
      <Footer />
    </Router>
  );
};

export default App;
