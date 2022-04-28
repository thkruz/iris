import React, { useEffect, useState } from "react";
import config from "./config";
import { Header, Body } from "./components";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

const ApiUrl = config[process.env.REACT_APP_NODE_ENV || 'development'].apiUrl;

function App() {
  let [names, setNames] = useState([]);

  useEffect(() => {
    fetch(ApiUrl + "/authors")
      .then((response) => response.json())
      .then((data) => setNames(data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div>
      <Router>
        <Header />
        <Body />
        <div>
          <Routes>
            <Route path="/" element={<h1>Home</h1>} />
            {/* <Route path="login" element={<Login />} /> */}
            <Route path="/student" element={<h1>Student</h1>} />
            <Route path="/instructor" element={<h1>Instructor</h1>} />
          </Routes>
        </div>
        App is running - good work:
        {names.map((author) => author.first_name + ' ')}
      </Router>
    </div>
  );
}

export default App;
