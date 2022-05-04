import React, { useEffect, useState } from 'react';
import config from './config';
import { Header, Body } from './components';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { StudentStack } from './components/Body/StudentStack/StudentStack';
import InstructorStack from './components/Body/InstructorStack/InstructorStack';
import Login from './components/Login/Login';

const ApiUrl = config[process.env.REACT_APP_NODE_ENV || 'development'].apiUrl;

function App() {
  let [names, setNames] = useState([]);

  useEffect(() => {
    fetch(ApiUrl + '/authors')
      .then(response => response.json())
      .then(data => setNames(data))
      .catch(err => console.log(err));
  }, []);

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
      </Router>
    </div>
  );
}

export default App;
