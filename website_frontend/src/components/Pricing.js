import React from "react";


export default function Pricing() {
  return (
    <section className="py-[73px] bg-custom-dark-blue">
      <div className="container px-4 mx-auto ">
        <h1 className="text-3xl text-white md:text-6xl font-bold mt-4 mb-14 text-center ">
          الباقات الشهرية
        </h1>
        <div className="flex -mx-4 flex-wrap-reverse">
          <div className="w-full xl:w-1/3 px-4 mb-12 xl:mb-0 text-center">
            <div className="max-w-md mx-auto px-6 py-12 md:p-12 bg-white border-3 border-indigo-900 rounded-2xl shadow-md">
              <div className=" flex flex-col text-center mb-12 text-custom-dark-blue">
                <h2 className="text-4xl font-bold mb-6">
                  الباقة الذهبية
                </h2>
                <div className="flex justify-center items-start mb-2">
                  <span className="pr-1 text-2xl font-extrabold">$</span>
                  <span className="md:text-6xl font-extrabold text-6xl">
                  49.90
                  </span>
                </div>
                <h2 className="text-[40px] mt-10 mb-6">
                210 كلمة مفتاحية                </h2>
              </div>
              
              <a
                className="inline-block w-full py-4 px-6 text-center leading-6 text-lg text-white font-extrabold bg-custom-green-primary hover:bg-custom-green-secondary border-3 border-custom-green-secondary rounded transition duration-200"
                href="#"
              >
                اشحن الآن
              </a>
            </div>
          </div>
          <div className="w-full xl:w-1/3 px-4 mb-12 xl:mb-0 text-center">
            <div className="max-w-md mx-auto px-6 py-12 md:p-12 bg-white border-3 border-indigo-900 rounded-2xl shadow-md">
              <div className=" flex flex-col text-center mb-12 text-custom-dark-blue">
                <h2 className="text-4xl font-bold mb-6">
                الباقة الفضية
                </h2>
                <div className="flex justify-center items-start mb-2">
                  <span className="pr-1 text-2xl font-extrabold">$</span>
                  <span className="md:text-6xl font-extrabold text-6xl">
                  19.90
                  </span>
                </div>
                <h2 className=" text-[40px] mt-10 mb-6">76 كلمة مفتاحية</h2>
              </div>
              
              <a
                className="inline-block w-full py-4 px-6 text-center leading-6 text-lg text-white font-extrabold bg-custom-green-primary hover:bg-custom-green-secondary border-3 border-custom-green-secondary rounded transition duration-200"
                href="#"
              >
                اشحن الآن
              </a>
            </div>
          </div>
          <div className="w-full xl:w-1/3 px-4 mb-12 xl:mb-0 text-center">
            <div className="max-w-md mx-auto px-6 py-12 md:p-12 bg-white border-3 border-indigo-900 rounded-2xl shadow-md">
              <div className=" flex flex-col text-center mb-12 text-custom-dark-blue">
                <h2 className="text-4xl font-bold mb-6">
                الباقة البرونزية
                </h2>
                <div className="flex justify-center items-start mb-2">
                  <span className="pr-1 text-2xl font-extrabold">$</span>
                  <span className="md:text-6xl font-extrabold text-6xl">
                  9.90
                  </span>
                </div>
                <h2 className="text-[40px] mt-10 mb-6">
                33 كلمة مفتاحية                </h2>
              </div>
              
              <a
                className="inline-block w-full py-4 px-6 text-center leading-6 text-lg text-white font-extrabold bg-custom-green-primary hover:bg-custom-green-secondary border-3 border-custom-green-secondary rounded transition duration-200"
                href="#"
              >
                اشحن الآن
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
