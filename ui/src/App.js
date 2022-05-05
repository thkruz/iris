import React from 'react';
// import config from './config';
import { Header, Body } from './components';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { StudentStack } from './components/Body/StudentStack/StudentStack';
import InstructorStack from './components/Body/InstructorStack/InstructorStack';
import Login from './components/Login/Login';
import Footer from './components/Footer/Footer';

// const ApiUrl = config[process.env.REACT_APP_NODE_ENV || 'development'].apiUrl;

function App() {
  return (
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
  );
}

export default App;
