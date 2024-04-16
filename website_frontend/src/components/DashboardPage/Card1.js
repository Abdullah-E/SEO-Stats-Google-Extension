import React from "react";

import { useUserCookies } from "../../api/api";

function Card1() {
  const { getUser } = useUserCookies()
  const user = getUser()
  const credits = user?.credits || 0
  console.log("user in Card1", user)

  return (
    <div className="p-6 bg-custom-light-green shadow rounded-3xl flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="leading-[40px] text-[30px] md:text-[25px] lg:text-[30px]">
          رصيدك الحالي
        </h3>
      </div>
      <div className="flex  flex-1">
        <span className="text-5xl md:text-4xl lg:text-5xl font-bold">
          {credits} كلمات
        </span>
      </div>
    </div>
  );
}

export default Card1;
