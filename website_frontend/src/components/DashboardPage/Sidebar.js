// components/DashboardPage/Sidebar.js
import React from 'react';
import Logo from "../../Resources/images/Logo.svg";
import HomeIcon from "../../Resources/images/icons/home-icon.svg";
import LogOutIcon from "../../Resources/images/icons/logout-icon.svg";
import MasareefIcon from "../../Resources/images/icons/masareef-icon.svg";
import { useCookies } from 'react-cookie';

import {useNavigate} from "react-router-dom"

function Sidebar({ isMenuVisible, toggleMenu }) {
  const [cookies, setCookie] = useCookies(['user']);
  const navigate = useNavigate();
  const homeClick = () => {
    navigate("/");
  }
  const logOut = () => {
    setCookie('user', '', { path: '/' })
    navigate("/");
  }

  return (
    <div className={`lg:block ${isMenuVisible ? "" : "hidden"} navbar-menu relative z-10`}>
      <div className="navbar-backdrop fixed lg:hidden inset-0 bg-gray-800 opacity-10" onClick={toggleMenu} />
      <nav dir="rtl" className="fixed top-0 ltr:left-0 rtl:right-0 bottom-0 flex flex-col w-60 pt-6 pb-8 bg-custom-light-green border-r shadow-xl overflow-y-auto">
        <div className="flex w-full items-center px-6 pb-6 mb-6 border-b border-blue-50">
          <a href="#">
            <img className="h-8" src={Logo} alt="Logo" />
          </a>
        </div>
        <div className="flex flex-col justify-between h-full px-4 pt-7">
          <ul className="mb-8">
            <li onClick={homeClick}>
              <a className="flex items-center pl-3 py-4 pr-6 text-custom-dark-blue hover:bg-indigo-50 rounded" href="#">
                <img className="size-5 mr-3 rtl:ml-3" src={HomeIcon} alt="Home" />
                <span className="text-xl font-serif">حساب شخصي</span>
              </a>
            </li>
            <li>
              <a className="flex items-center pl-3 py-4 pr-6 text-custom-dark-blue hover:bg-indigo-50 rounded" href="#">
                <img className="size-5 mr-3 rtl:ml-3" src={MasareefIcon} alt="Masareef" />
                <span className="text-xl font-serif">مصاريف</span>
              </a>
            </li>
          </ul>

          <div className="border-custom-dark-blue border-t-2 pt-2">
            <a className="flex items-center pl-3 py-2 pr-6 text-custom-dark-blue hover:bg-indigo-50 rounded" href="#">
              <img className="size-5 mr-3 rtl:ml-3" src={LogOutIcon} alt="Logout" />
              <span className="text-xl font-serif" onClick={logOut}>تسجيل خروج</span>
            </a>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Sidebar;
