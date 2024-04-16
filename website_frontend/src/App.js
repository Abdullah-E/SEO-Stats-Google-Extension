import React, {useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import MainPage from './pages/MainPage';
import DashboardPage from './pages/DashboardPage';

import { addCredits, useUserCookies } from './api/api';

function App() {

  const {getUserId, getUser} = useUserCookies()
  const g_id_test = getUserId()
  console.log("g_id_test", g_id_test)

  useEffect(() => {
    const Paddle = window.Paddle;

    const handlePaddleEvent = (data) => {
        if (data.name === "checkout.completed") {
            console.log(data);
            const items_arr = data.data.items;
            let total_credits = 0;
            items_arr.forEach(item => {
                const credits = parseInt(item.product.name.split(' ')[0]);
                total_credits += credits * item.quantity;
            });

            const g_id = getUserId();
            const user = getUser();
            console.log("User:", user, "UserID:", g_id);

            addCredits(g_id, total_credits).then(response => {
                console.log("Response:", response);
            }).catch(error => {
                console.error("Error in addCredits:", error);
            });
        }
    };

    Paddle.Initialize({
        token: "test_18780c77df0655fc4d02d1b24ec",
        eventCallback: handlePaddleEvent
    });
  }, [getUserId, getUser])
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
