import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import MainPage from './pages/MainPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  const Paddle = window.Paddle
  Paddle.Initialize({ 
    token: "test_18780c77df0655fc4d02d1b24ec",
    eventCallback: function(data) {
      if(data.name == "checkout.completed") {
        console.log(data)
      }
    }
  })
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;
