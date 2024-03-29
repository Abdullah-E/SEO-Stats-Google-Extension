import React from "react";


function Card3() {
  // Card 3 Data
  // Options.sandbox = true
  const Paddle = window.Paddle
  const items = [
    {
      priceId:"pri_01ht33qbvsszdnt109576a64z2",
      quantity:1
    }

  ]
  const priceClick = () => {
    console.log("clciy")
    Paddle.Checkout.open({
      items: items
    })
  }
  const card3Data = [
    { key: "row1", words: "10 كلمات", rate: "0.4", price: "4" },
    { key: "row2", words: "50 كلمة", rate: "0.4", price: "20" },
    { key: "row3", words: "100 كلمة", rate: "0.3", price: "30" },
    { key: "row3", words: "150 كلمة", rate: "0.3", price: "45" },
    { key: "row3", words: "200 كلمة", rate: "0.25", price: "50" },
  ];

  return (
    <div className="p-6 bg-custom-light-green shadow rounded-3xl flex-1 flex flex-col">
      <div className="mb-3">
        <h3 className="leading-[40px] text-[30px] md:text-[25px] lg:text-[30px]">
          اشحن رصيد
        </h3>
      </div>
      <div className="flex-1">
        <table className="w-full table-auto">
          <tbody>
            {card3Data.map((data) => (
              <tr key={data.key}>
                <td className="flex flex-col font-bold text-3xl md:text-2xl lg:text-3xl text-right py-3">
                  {data.words}
                  <span className="flex items-center text-[16px] md:text-[14px] lg:text-[16px] font-helvetica-arabic font-normal leading-[23px]">
                    <span className="text-[10px] md:text-[9px] lg:text-[10px] opacity-60 self-center">
                      $
                    </span>
                    {data.rate} للكلمة الواحدة
                  </span>
                </td>
                <td className="text-center">
                  <span onClick={priceClick} className="py-[2px] bg-custom-dark-blue text-white text-2xl md:text-xl lg:text-2xl font-bold rounded-full flex items-center justify-center gap-[2px]">
                    <span className="text-sm md:text-xs lg:text-sm opacity-60">
                      $
                    </span>
                    {data.price}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Card3;
