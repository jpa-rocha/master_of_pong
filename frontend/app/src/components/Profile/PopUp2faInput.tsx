import axios from "axios";
//import { useEffect } from "react";
import { getToken } from "../../utils/Utils";

axios.defaults.baseURL = process.env.REACT_APP_BACKEND;
axios.defaults.withCredentials = true;

type PopUpTurnOff2faProps = {
  isOpen: boolean;
  onClose: () => void;
  UserId: string | undefined;
  off: boolean; // True = turn off 2fa, False = validate 2fa
};

const PopUpTurnOff2fa: React.FC<PopUpTurnOff2faProps> = ({
  isOpen,
  onClose,
  UserId,
  off,
}) => {
  const handleTurnOff2fa = async (
    twoFactorAuthenticationCode: string,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    const config = {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": process.env.REACT_APP_FRONTEND,
        "Access-Control-Allow-Methods":
          "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
        jwtToken: getToken(process.env.REACT_APP_JWT_NAME as string),
      },
      credentials: "include",
    };

    await axios
      .post(
        `${process.env.REACT_APP_BACKEND}/api/2fa/turn-off/${UserId}`,
        {
          twoFactorAuthenticationCode,
        },
        config
      )
      .then((res) => {
        console.log(res);
        if (res.status === 200) {
          // data
          onClose();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleTurnOff2fa(event.currentTarget.value, event);
      event.currentTarget.value = "";
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="relative bg-white rounded-lg shadow p-6">
        <button
          className="absolute top-3 right-3 text-gray-400 bg-transparent
	  	hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto "
          onClick={onClose}
        >
          X
        </button>
        <form>
          <input
            type="text"
            placeholder="Enter code"
            onKeyDown={handleKeyDown}
            className="m-6 bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-900
			focus:border-blue-500 block p-2.5"
          />
        </form>
      </div>
    </>
  );
};

export default PopUpTurnOff2fa;
