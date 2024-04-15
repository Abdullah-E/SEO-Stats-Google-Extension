import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {useCookies} from "react-cookie"

import MainPage from './pages/MainPage';
import DashboardPage from './pages/DashboardPage';

import { addCredits } from './api/api';

function App() {

  const [cookies, setCookie, getCookie] = useCookies(["user"])
  const Paddle = window.Paddle
  Paddle.Initialize({ 
    token: "test_18780c77df0655fc4d02d1b24ec",
    eventCallback: function(data) {
      if(data.name == "checkout.completed") {

        console.log(data)
        //call add credits here
        const items_arr = data.data.items
        let total_credits = 0
        for (let i = 0; i < items_arr.length; i++) {
          const item = items_arr[i]
          const credits = item.product.name.split(' ')[0]

          total_credits += parseInt(credits) * item.quantity
          
        }
        const g_id = cookies.user.id
        console.log(cookies.user)
        console.log("g_id in paddle callback", g_id)
        addCredits(g_id, total_credits)

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
