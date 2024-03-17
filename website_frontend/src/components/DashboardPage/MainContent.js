import React from "react";
import Card1 from "./Card1";
import Card2 from "./Card2";
import Card3 from "./Card3";

function MainContent() {
  return (
    <div className="lg:ml-60 rtl:lg:mr-60 h-full flex flex-col overflow-hidden lg:w-[calc(100%-320px)]">
  <section className="flex-1 p-6 flex flex-col md:flex-row gap-4 overflow-y-auto">
    <div className="container mx-auto px-4 h-full text-custom-dark-blue flex flex-col md:flex-row gap-8">
      <div className="flex flex-col gap-4 w-full md:w-1/2">
        <Card1 />
        <Card2 />
      </div>
      <div className="w-full md:w-1/2">
        <Card3 />
      </div>
    </div>
  </section>
</div>

  );
}

export default MainContent;
