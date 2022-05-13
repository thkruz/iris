import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { StudentStack, InstructorStack, Body, Header, Footer } from './components/';
import Login from './components/Login/Login';

// const ApiUrl = config[process.env.REACT_APP_NODE_ENV || 'development'].apiUrl;

function App() {
  return (
    <div>
      <Router>
        <Header />
        <Body>
          <Routes>
            <Route path='/' element={<StudentStack />} />
            <Route path='login' element={<Login />} />
            <Route path='/student' element={<StudentStack />} />
            <Route path='/instructor' element={<InstructorStack />} />
          </Routes>
        </Body>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
