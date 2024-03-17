import React from 'react'
import Logo from '../Resources/images/Logo.svg'
import chromeICON from'../Resources/images/Rectanglechrome.svg'

const Footer = () => {
  return (
    <nav className='flex justify-between items-center py-6 px-10 relative bg-green-200'>
        <div className='hidden xl:flex items-center'>
        <button class="bg-custom-dark-blue hover:bg-custom-dark-blue text-white font-bold py-2 px-2 rounded-full inline-flex items-center">
              <span className='text-[30px] px-4 -mt-2'>سجل الدخول</span>
              <span class="flex-shrink-0 h-10 w-10 relative ">
                <img class="rounded-full border border-white shadow-sm w-full h-auto" src={chromeICON} alt="Logo" />
              </span>
            </button>
          </div>

          <ul className='hidden xl:flex absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white'>
            <li>
              <a
                className='text-2xl mr-14 2xl:mr-20  hover:text-custom-dark-blue'
                href='#'
              >
                اسعار
              </a>
            </li>
            <li>
              <a
                className='text-2xl mr-14 2xl:mr-20  hover:text-custom-dark-blue'
                href='#'
              >
                مميزات
              </a>
            </li>
            <li>
              <a
                className='text-2xl  hover:text-custom-dark-blue'
                href='#'
              >
                شرح
              </a>
            </li>
          </ul>
          <a className='text-lg font-bold' href='#'>
            <img
              className='w-[150px] h-auto'
              src={Logo}
              alt=''
              width='auto'
            />
          </a>
          <div className='xl:hidden'>
            <button className='navbar-burger focus:outline-none text-custom-dark-blue hover:text-custom-dark-blue'>
              <svg
                className='block h-6 w-6'
                fill='currentColor'
                viewBox='0 0 20 20'
                xmlns='http://www.w3.org/2000/svg'
              >
                <title>Mobile menu</title>
                <path d='M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z' />
              </svg>
            </button>
          </div>
        </nav>
  );
};

export default Footer;
