import axios from "axios";
import { useEffect } from "react";
import { getToken } from "../../utils/Utils";

type PopUpTurnOff2fa = {
  isOpen: boolean;
  onClose: () => void;
  UserId: string | undefined;
  off: boolean; // True = turn off 2fa, False = validate 2fa
};

const PopUpTurnOff2fa: React.FC<PopUpTurnOff2fa> = ({
  isOpen,
  onClose,
  UserId,
  off,
}) => {
  const handleTurnOff2fa = async (
    twoFactorAuthenticationCode: string,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    console.log("handleTurnOff2fa CALLED");
    event.preventDefault();
    const config = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://localhost:3000",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
        "jwtToken": getToken("jwtToken"),
      },
    };
    
    await axios
      .post(`/api/2fa/turn-off/${UserId}`, {
        twoFactorAuthenticationCode,
      }, config)
      .then((res) => {
        console.log(res);
        onClose();
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
      <div>
        <form>
          <input
            type="text"
            placeholder="Enter code"
            onKeyDown={handleKeyDown}
          />
        </form>
        <button className="styleButton" onClick={onClose}>
          X
        </button>
      </div>
    </>
  );
};

export default PopUpTurnOff2fa;
