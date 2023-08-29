import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { AxiosConfig } from "../../utils/Utils";

axios.defaults.baseURL = process.env.REACT_APP_BACKEND;
axios.defaults.withCredentials = true;

type PopUpGenerate2faProps = {
  isOpen: boolean;
  onClose: () => void;
  userID: string | undefined;
};

const PopUpGenerate2fa: React.FC<PopUpGenerate2faProps> = ({
  isOpen,
  onClose,
  userID,
}) => {
  const [qrCode, setQrCode] = useState<string>();
  const generate = useRef(true);

  useEffect(() => {
    if (generate.current) {
      generate.current = false;
      (async () => {
        try {
          const response = await axios.post(
            `/api/2fa/generate/${userID}`,
            {},
            { responseType: "arraybuffer" }
          );

          const imageBlob = new Blob([response.data], { type: "image/png" });
          const imageSrc = URL.createObjectURL(imageBlob);

          setQrCode(imageSrc);
        } catch (error) {
          console.error("Error 441: please contact us if this persists");
        }
      })();
    }
  }, [userID]);

  const handle2faTurnOn = async (
    twoFactorAuthenticationCode: string,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    event.preventDefault();

    await axios
      .post(
        `${process.env.REACT_APP_BACKEND}/api/2fa/turn-on/${userID}`,
        {
          twoFactorAuthenticationCode,
        },
        AxiosConfig
      )
      .then((data) => {
        if (data.status === 200) {
          if (data.data === null) {
            alert("Wrong code!");
          } else {
            onClose();
          }
        }
      })
      .catch(() => {
        alert("Wrong code!");
      });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handle2faTurnOn(event.currentTarget.value, event);
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
        <h1 className="font-bold text-lg tracking-wide uppercase text-center">
          2fa
        </h1>
        <div className="font-bold text-lg tracking-wide uppercase text-center">
          <img src={qrCode} alt="QR Code" />
        </div>
        <form name="2faCode">
          <input
            name="2faCode"
            type="text"
            maxLength={6}
            minLength={6}
            placeholder="Enter 2fa Code"
            onKeyDown={handleKeyDown}
            className="m-6 bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-900
			focus:border-blue-500 block p-2.5"
          />
        </form>
      </div>
    </>
  );
};

export default PopUpGenerate2fa;
