import React, { useEffect } from "react"
import Logo from "../Resources/images/Logo.svg"
import DownloadButton from "../components/UserBadge"
import { useState } from "react"
import HomeIcon from "../Resources/images/icons/home-icon.svg"
import LogOutIcon from "../Resources/images/icons/logout-icon.svg"
import MasareefIcon from "../Resources/images/icons/masareef-icon.svg"
import MainContent from "../components/DashboardPage/MainContent"
import Navbar from "../components/DashboardPage/Navbar"
import Sidebar from "../components/DashboardPage/Sidebar"
import { useCookies } from "react-cookie"
import {getProfile, accessTokenRequest } from "../api/api"
import { Navigate } from "react-router-dom"

export default function DashboardPage() {
  
  const [cookies, setCookie, getCookie] = useCookies(["user"])

  useEffect(() =>{
    if(cookies.user){
      console.log("cookies.user", cookies.user)
    }else{

      const url = window.location.href
      if (!url){
        Navigate("/")
      }
      const params = url.split("?")[1]
      const paramList = params.split("&")
      let paramObj = {}
      paramList.forEach(param => {
        const [key, value] = param.split("=")
        paramObj[key] = value
      })
      const accessToken = paramObj.code
      console.log("accessToken", accessToken)
      accessTokenRequest(accessToken)
      .then(response => {

          // Check if response contains profile data
          if (response && response.profile) {
            setCookie('user', response.profile, { path: '/' })
            console.log("cookie set:", response.profile)
          } 
          // else {
          //     throw new Error('Invalid response from server: Missing profile data');
          // }
      })
      .catch(error => {
          console.error('Error handling access token:', error);
      }, [])
  
      
    }

    

  })

  const [isMenuVisible, setIsMenuVisible] = useState(false)

  // Function to toggle the menu's visibility
  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible)
  }

  return (
    <div dir="rtl" className="flex flex-col h-screen overflow-auto">
      <Navbar toggleMenu={toggleMenu}/>
      <div>
        <Sidebar isMenuVisible={isMenuVisible} toggleMenu={toggleMenu}/>
        <MainContent />
      </div>
    </div>
  )
}
