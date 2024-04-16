import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { UserProvider, useUser } from './contexts/UserContext';
// import {useCookies} from "react-cookie"

import MainPage from './pages/MainPage';
import DashboardPage from './pages/DashboardPage';

import { addCredits, useUserCookies } from './api/api';

function App() {
  

  // const [cookies, setCookie, getCookie] = useCookies(["user"])
  
  // console.log("cookies", cookies)
  // const g_id = cookies.user.id
  
  // console.log("user in app", user)
  const {getUserId} = useUserCookies()

  const handlePaddleEvent = (data) => {
    // const {user} = useUser()
    if(data.name == "checkout.completed") {
      // console.log("user frm context", user)
      console.log(data)
      const items_arr = data.data.items
      let total_credits = 0
      for (let i = 0; i < items_arr.length; i++) {
        const item = items_arr[i]
        const credits = item.product.name.split(' ')[0]
        total_credits += parseInt(credits) * item.quantity
        
      }
      // const g_id = cookies.user.id
      // console.log("g_id in paddle callback", g_id)
      const g_id = getUserId()
      // addCredits( g_id, total_credits)
      const response = addCredits( g_id, total_credits)
      console.log("response", response)

    }
  }

  const Paddle = window.Paddle
  Paddle.Initialize({ 
    token: "test_18780c77df0655fc4d02d1b24ec",
    eventCallback: handlePaddleEvent
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
