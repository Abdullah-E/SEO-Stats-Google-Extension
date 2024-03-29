// components/DashboardPage/Navbar.js
import React from 'react';
import Logo from "../../Resources/images/Logo.svg";
import UserBadge from "../UserBadge";

function Navbar({ toggleMenu}) {
  return (
    <section className="py-5 px-6 bg-custom-green-primary shadow relative z-50 h-[100px]">
      <nav className="relative">
        <div className="flex justify-between">
          <div className="flex">
            <img src={Logo} alt="Logo" />
          </div>
          <div className="lg:hidden">
            <button className="flex items-center" onClick={toggleMenu}>
              <svg
                className="text-custom-dark-blue bg-indigo-100 block h-8 w-8 p-2 rounded"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
              >
                <title>Mobile menu</title>
                <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
              </svg>
            </button>
          </div>
          <div className="hidden lg:block">
            <UserBadge/>
          </div>
        </div>
      </nav>
    </section>
  );
}

export default Navbar;
