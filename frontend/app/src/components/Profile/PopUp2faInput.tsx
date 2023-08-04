import axios from "axios";
import { useEffect } from "react";

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
    event.preventDefault();
    await axios
      .post(`/api/2fa/turn-off/${UserId}`, {
        twoFactorAuthenticationCode,
      })
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
