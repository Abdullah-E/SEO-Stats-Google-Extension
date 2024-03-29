import React, { useEffect, useState } from "react"
import Logo from "../Resources/images/Logo.svg"
import chromeICON from "../Resources/images/Rectanglechrome.svg"
import Heroandcurve from "../Resources/images/imgHero.png"
import MobileMenu from "./MobileMenu" // Adjust the path based on your file structure
import Hero from "./Hero"
import UserBadge from "./UserBadge"
import { useCookies } from 'react-cookie'


export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [cookies, setCookie, removeCookie] = useCookies(['user'])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  };

  return (
    <section className="relative pb-24">
      <div className="absolute top-0 right-0 flex w-full h-3/4 md:h-2/3 bg-custom-color-1"></div>
      <nav className="flex mb-20 justify-between items-center py-6 px-10 relative bg-green-200">
        {/* These elements are hidden on xl screens and visible on smaller screens */}
        <button
          className="xl:hidden"
          onClick={toggleMenu}
          style={{ color: "black" }}
        >
          <svg
            className="block h-6 w-6"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Mobile menu</title>
            <path d="M4 5h16v2H4V5zm0 6h16v2H4v-2zm0 6h16v2H4v-2z" />
          </svg>
        </button>

        {/* These elements are hidden on screens smaller than xl */}
        <div className="hidden xl:flex items-center">
          {/* <button className="bg-custom-dark-blue hover:bg-custom-dark-blue text-white font-bold py-2 px-2 rounded-full inline-flex items-center">
            <span className="text-[30px] px-4 -mt-2">سجل الدخول</span>
            <span className="flex-shrink-0 h-10 w-10 relative">
              <img
                className="rounded-full border border-white shadow-sm w-full h-auto"
                src={chromeICON}
                alt="Logo"
              />
            </span>
          </button> */}
          {cookies.user ? <UserBadge profile = {cookies.user}/> : <UserBadge/>}
          {/* <GLogin/> */}
        </div>

        <ul className="hidden xl:flex absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
          <li>
            <a
              className="text-2xl mr-14 2xl:mr-20 hover:text-custom-dark-blue"
              href="#"
            >
              اسعار
            </a>
          </li>
          <li>
            <a
              className="text-2xl mr-14 2xl:mr-20 hover:text-custom-dark-blue"
              href="#"
            >
              مميزات
            </a>
          </li>
          <li>
            <a className="text-2xl hover:text-custom-dark-blue" href="#">
              شرح
            </a>
          </li>
        </ul>

        <a className="text-lg font-bold" href="#">
          <img className="w-[150px] h-auto" src={Logo} alt="" width="auto" />
        </a>
      </nav>

      {isMenuOpen && (
        <MobileMenu isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
      )}

      <Hero></Hero>
    </section>
  )
}
