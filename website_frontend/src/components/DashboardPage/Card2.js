import React from "react";

function Card2() {
  const Paddle = window.Paddle;

  const priceClick = (priceId) => {
    console.log("Clicked priceId:", priceId);
    Paddle.Checkout.open({
      items: [
        {
          priceId: priceId,
          quantity: 1
        }
      ]
    });
  };

  const card2Data = [
    { id: "1", words: "33 كلمة", price: "9.90", priceId: "pri_01htyqsv97r5n6mp05p8bjkb98" },
    { id: "2", words: "76 كلمة", price: "19.90" , priceId: "pri_01htyqtrkfrstsvp4zbtzcfjwv"},
    { id: "3", words: "120 كلمة", price: "29.90" ,priceId: "pri_01htyqvtgcvz0kmykvarbp480a"},
  ];

  return (
    <div className="p-6 bg-custom-light-green shadow rounded-3xl flex-1 flex flex-col">
      <div className="mb-3">
        <h3 className="leading-[40px] text-[30px] md:text-[25px] lg:text-[30px]">
          رصيدك الحالي
        </h3>
      </div>
      <div className="flex-1">
        <table className="w-full table-auto">
          <tbody>
            {card2Data.map((item) => (
              <tr key={item.id}>
                <td className="font-bold text-3xl md:text-2xl lg:text-3xl text-right py-3 md:py-4 lg:py-5">
                  {item.words}{" "}
                  <span className="text-sm md:text-xs lg:text-base">شهريا</span>
                </td>
                <td className="text-center">
                  <span
                    onClick={() => priceClick(item.priceId)}
                    className="py-[2px] bg-custom-dark-blue text-white text-xl md:text-lg lg:text-2xl font-bold rounded-full flex items-center justify-center gap-[2px]"
                  >
                    <span className="text-xs md:text-sm lg:text-sm opacity-60">
                      $
                    </span>
                    {item.price}
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

export default Card2;
