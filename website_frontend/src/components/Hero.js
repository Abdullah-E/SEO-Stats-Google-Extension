import React from "react";
import Logo from '../Resources/images/Logo.svg';
import chromeICON from '../Resources/images/Rectanglechrome.svg';
import Heroandcurve from '../Resources/images/imgHero.png';
import MobileMenu from './MobileMenu'; // Adjust the path based on your file structure

const Hero = () => {
  return (
    <div className='container px-4 mx-auto relative'>
                <div className='max-w-5xl mx-auto text-center'>
                    <h1 className='font-bold text-custom-dark-blue max-w-4xl mx-auto text-3xl sm:text-4xl lg:text-7xl mt-1 mb-6'>
                        كلمات مفتاحية بضغطة زر
                    </h1>
                    <p className='text-custom-gray text-xl md:text-3xl leading-8 mb-8'>
                        قم بتحسين محركات البحث، وتسويق المحتوى، وأبحاث المنافسين، مباشرة أثناء تصفحك للويب.
                    </p>
                    <button className="bg-custom-green-primary hover:bg-custom-dark-blue text-white font-bold py-2 px-2 rounded-full inline-flex items-center">
                        <span className='text-[30px] px-4 -mt-2'>حمل الأداة</span>
                        <span className="flex-shrink-0 h-10 w-10 relative">
                            <img className="rounded-full border border-white shadow-sm w-full h-auto" src={chromeICON} alt="Logo" />
                        </span>
                    </button>
                    <img className='block w-full h-auto lg:h-140 object-cover rounded-2xl' src={Heroandcurve} alt='' />
                </div>
            </div>
  );
};

export default Hero;
