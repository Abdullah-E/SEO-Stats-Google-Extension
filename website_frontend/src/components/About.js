import React from 'react'
import FeatureIMG from '../Resources/images/section2img.svg'
import chromeICON from '../Resources/images/Rectanglechrome.svg'

export default function About() {
    return (
        <section className='py-18 bg-custom-green-primary text-white'>
          <div className='container px-4 mx-auto relative'>
            <div className='flex flex-wrap -mx-4 items-center'>
              <div className='w-full lg:w-1/2 px-4 order-last lg:order-first'>
                <img
                  className='block lg:max-w-lg w-full h-156 object-cover rounded-2xl'
                  src={FeatureIMG}
                  alt=''
                />
              </div>
              <div className='w-full lg:w-1/2 px-4 mb-12 lg:mb-0 text-right'>
                <h1 className='text-3xl sm:text-4xl lg:text-[55px] 2xl:text-5xl font-bold mt-2 mb-10'>
                ما هي أداة كلمات مفتاحية
                </h1>
                <p className='text-[30px] leading-10  mb-8 '>
                هي أداة رائدة تمكنك من معرفة معدل تكرار البحث بكلماتك على موقع جوجل وموقع أمازون سواء كنت تدير موقعًا إلكترونيًا أو تسوق منتجاتك عبر الإنترنت، فهذه الأداة الرائعة هي حلك المثالي للحصول على رؤى قيمة ترتقي بأداء محتواك إلى أعلى المستويات
                </p>
                <button class="bg-custom-dark-blue hover:bg-custom-dark-blue text-white font-bold py-2 px-2 rounded-full inline-flex items-center transition duration-200">
              <span className='text-[30px] px-4 -mt-2'>حمل الأداة</span>
              <span class="flex-shrink-0 h-10 w-10 relative ">
                <img class="rounded-full border border-white shadow-sm w-full h-auto" src={chromeICON} alt="Logo" />
              </span>
            </button>
              </div>
            </div>
          </div>
        </section>
    )
}
