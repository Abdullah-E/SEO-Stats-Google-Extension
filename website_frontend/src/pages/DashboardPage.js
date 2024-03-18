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
import {getProfile} from "../api/api"

export default function DashboardPage() {
  
  const [cookies, setCookie, getCookie] = useCookies(["user"])
  const [profile, setProfile] = useState({})

  useEffect(() =>{
    if(!cookies.user){
      window.location.href = "/"
    }
    getProfile(cookies.user.googleId)
    .then(response => {
      setProfile(response)
    })
  }, [cookies.user])
  

  const [isMenuVisible, setIsMenuVisible] = useState(false)

  // Function to toggle the menu's visibility
  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible)
  }

  return (
    <div dir="rtl" className="flex flex-col h-screen overflow-auto">
      <Navbar toggleMenu={toggleMenu} profile={profile}/>
      <div>
        <Sidebar isMenuVisible={isMenuVisible} toggleMenu={toggleMenu}/>
        <MainContent />
      </div>
    </div>
  )
}
