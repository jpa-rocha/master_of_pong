import axios from "axios";
//import { useEffect } from "react";
import { AxiosConfig } from "../../utils/Utils";

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

    await axios
      .post(
        `${process.env.REACT_APP_BACKEND}/api/2fa/turn-off/${UserId}`,
        {
          twoFactorAuthenticationCode,
        },
        AxiosConfig
      )
      .then((res) => {
        if (res.status === 200) {
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
        <form id="2fainput">
          <input
            type="text"
            maxLength={6}
            minLength={6}
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
