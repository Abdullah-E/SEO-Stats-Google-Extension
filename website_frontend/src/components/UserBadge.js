import React from "react";
import { UserIcon } from "@heroicons/react/solid";
import {useNavigate} from "react-router-dom"
import {OauthRedirect} from "../api/api"
import { useCookies } from "react-cookie";

function UserBadge() {
  const [cookies, setCookie, getCookie] = useCookies(["user"])
  const profile = cookies.user
  
  const logged_in = profile? profile.email? true: false :false
  console.log("logged_in", logged_in)
  const navigate = useNavigate();
  const handleClick = () => {
    if(logged_in){
      navigate("/dashboard");

    }else{
      OauthRedirect()
      .then((data)=>{
        if(data.url){
          window.location.href = data.url
        }
      })
    }
      
  }
  return (
    <button
      onClick={handleClick}
      className="cursor-pointer inline-flex items-center rounded-full 
px-9 py-3 text-xl font-semibold text-white hover:text-white   hover:bg-custom-dark-blue transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-75 duration-300 focus:bg-transparent focus:text-custom-dark-blue"
    >
      <div className="flex gap-2">
        <div className="flex justify-center items-center">
          <div className="bg-white rounded-full p-2 flex justify-center items-center">
            <UserIcon className="h-3 w-3 text-gray-800" />
          </div>
        </div>
        <span>{profile? profile.name: ""}</span>
      </div>
    </button>
  );
}

export default UserBadge;
