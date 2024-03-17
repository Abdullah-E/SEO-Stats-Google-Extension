import React, { useEffect } from "react";
import Logo from "../Resources/images/Logo.svg";
import DownloadButton from "../components/DownloadButton";
import { useState } from "react";
import HomeIcon from "../Resources/images/icons/home-icon.svg";
import LogOutIcon from "../Resources/images/icons/logout-icon.svg";
import MasareefIcon from "../Resources/images/icons/masareef-icon.svg";
import MainContent from "../components/DashboardPage/MainContent";
import Navbar from "../components/DashboardPage/Navbar";
import Sidebar from "../components/DashboardPage/Sidebar";

export default function DashboardPage() {
  // state variable to control the visibility of the navbar menu
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // Function to toggle the menu's visibility
  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  return (
    <div dir="rtl" className="flex flex-col h-screen overflow-auto">
      <Navbar toggleMenu={toggleMenu} />
      <div>
        <Sidebar isMenuVisible={isMenuVisible} toggleMenu={toggleMenu} />
        <MainContent />
      </div>
    </div>
  );
}
