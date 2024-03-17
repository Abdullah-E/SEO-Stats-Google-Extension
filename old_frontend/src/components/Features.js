import React from "react";
import ICON2 from "../Resources/images/icon2.svg";
import ICON3 from "../Resources/images/icon3.svg";

export default function Features() {
  return (
    <section className="py-[73px] bg-custom-green-third bg-opacity-10 text-custom-dark-blue">
      <div className="container px-4 mx-auto relative">
        <div className=" mb-16 text-center">
          <h1 className="text-9xl md:text-8xl font-extrabold font-heading mt-4 mb-6">
            أهم المميزات
          </h1>
        </div>
        <div className="flex flex-wrap -mx-4 text-right gap-6 lg:gap-0">
        <div className="w-full lg:w-1/3 px-4">
            <div className="h-full  max-w-md mx-auto py-4 px-8 bg-custom-green-secondary bg-opacity-10  shadow-sm rounded-2xl ">
              <div className="flex flex-row-reverse justify-items-start gap-4  mb-6">
                <img className="block " src={ICON3} alt="" />
                <h4 className="text-[31px] leading-9 font-bold">
                تحليل الكلمات المفتاحية على أمازون 
                </h4>
                
              </div>
              <p className="text-xl text-custom-gray leading-8">
                تتيح لك أداة "كلمات مفتاحية" معرفة معدل تكرار البحث بكلمات
                مفتاحية معينة على محرك البحث جوجل، وهو ما يمكنك من فهم مدى
                انتشار الكلمات المفتاحية، وبالتالي انتقاء أفضل الكلمات لتحسين
                محتواك وتعزيز جاذبيته للزوار
              </p>
            </div>
          </div>
          <div className="w-full lg:w-1/3 px-4">
            <div className="h-full  max-w-md mx-auto py-4 px-8 bg-custom-green-secondary bg-opacity-10  shadow-sm rounded-2xl ">
              <div className="flex flex-row-reverse justify-items-start gap-4  mb-6">
                <img className="block " src={ICON2} alt="" />
                <h4 className="text-3xl font-bold">
                  سهلة الاستخدام
                </h4>
                
              </div>
              <p className="text-xl text-custom-gray leading-8">
                تتيح لك أداة "كلمات مفتاحية" معرفة معدل تكرار البحث بكلمات
                مفتاحية معينة على محرك البحث جوجل، وهو ما يمكنك من فهم مدى
                انتشار الكلمات المفتاحية، وبالتالي انتقاء أفضل الكلمات لتحسين
                محتواك وتعزيز جاذبيته للزوار
              </p>
            </div>
          </div>
          <div className="w-full lg:w-1/3 px-4">
            <div className="h-full  max-w-md mx-auto py-4 px-8 bg-custom-green-secondary bg-opacity-10  shadow-sm rounded-2xl ">
              <div className="flex flex-row-reverse justify-items-start gap-4  mb-6">
                <img className="block " src={ICON3} alt="" />
                <h4 className="text-3xl font-bold">
                معدل تكرار
الكلمات المفتاحية 
                </h4>
                
              </div>
              <p className="text-xl text-custom-gray leading-8">
                تتيح لك أداة "كلمات مفتاحية" معرفة معدل تكرار البحث بكلمات
                مفتاحية معينة على محرك البحث جوجل، وهو ما يمكنك من فهم مدى
                انتشار الكلمات المفتاحية، وبالتالي انتقاء أفضل الكلمات لتحسين
                محتواك وتعزيز جاذبيته للزوار
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
