import React from 'react';
import Logo from '../Resources/images/Logo.svg';
import chromeICON from "../Resources/images/Rectanglechrome.svg";

const MobileMenu = ({ isMenuOpen, toggleMenu }) => {
  if (!isMenuOpen) return null;

  return (
    <div className='navbar-menu relative z-50 text-white'>
      <div className='navbar-backdrop fixed inset-0 bg-gray-800 opacity-25' />
      <nav className='fixed top-0 left-0 bottom-0 flex flex-col w-full md:w-5/6 max-w-sm py-8 px-8 bg-green-200 border-r overflow-y-auto'>
        <div className='flex items-center mb-8'>
          <a className='mr-auto text-2xl font-bold leading-none' href='#'>
            <img
              className='h-6'
              src={Logo}
              alt='Logo'
              width='auto'
            />
          </a>
          {/* Placeholder for closing the menu, you can implement the onClick handler to change isMenuOpen to false */}
          <button onClick={toggleMenu} className='navbar-close'>
            <svg
              className='h-6 w-6 text-gray-500 cursor-pointer hover:text-gray-500'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>
        <ul className='py-10'>
          <li className='mb-1'>
            <a
              className='block p-4 text-lg font-bold hover:bg-green-300 rounded transition duration-200'
              href='#'
            >
              اسعار
            </a>
          </li>
          <li className='mb-1'>
            <a
              className='block p-4 text-lg font-bold hover:bg-green-300 rounded transition duration-200'
              href='#'
            >
              مميزات
            </a>
          </li>
          <li className='mb-1'>
            <a
              className='block p-4 text-lg font-bold hover:bg-green-300 rounded transition duration-200'
              href='#'
            >
              شرح
            </a>
          </li>
        </ul>
        <div className="xl:flex items-center">
          <button className="bg-custom-dark-blue hover:bg-custom-dark-blue text-white font-bold py-2 px-2 rounded-full inline-flex items-center">
            <span className="text-[30px] px-4 -mt-2">سجل الدخول</span>
            <span className="flex-shrink-0 h-10 w-10 relative">
              <img
                className="rounded-full border border-white shadow-sm w-full h-auto"
                src={chromeICON}
                alt="Logo"
              />
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default MobileMenu;
