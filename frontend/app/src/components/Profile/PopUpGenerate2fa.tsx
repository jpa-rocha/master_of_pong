import axios from "axios";
import React, { useEffect, useState } from "react";
import { getToken, getUser } from "../../utils/Utils";
import { get } from "http";
import fs from "fs";
import { ThemeContext } from "@emotion/react";
import { on } from "events";

axios.defaults.baseURL = "http://localhost:5000/";
axios.defaults.withCredentials = true;

type PopUpGenerate2fa = {
  isOpen: boolean;
  onClose: () => void;
  userID: string | undefined;
};

interface User {
  id: string;
  username: string;
}

const PopUpGenerate2fa: React.FC<PopUpGenerate2fa> = ({
  isOpen,
  onClose,
  userID,
}) => {
  const [qrCode, setQrCode] = useState<string>();

  useEffect(() => {
    (async () => {
      const getQrCode = await axios.post(
        `/api/2fa/generate/${userID}`,
        {},
        { responseType: "arraybuffer" }
      );
      const imageSrc = `data:image/png;base64,${btoa(
        new Uint8Array(getQrCode.data).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      )}`;

      setQrCode(imageSrc);
    })();
  }, [userID]);

  const handle2faTurnOn = async (
    twoFactorAuthenticationCode: string,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    const config = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://localhost:3000",
        "Access-Control-Allow-Methods":
          "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
        jwtToken: getToken("jwtToken"),
      },
      credentials: "include",
    };
    const res = await axios
      .post(
        `http://localhost:5000/api/2fa/turn-on/${userID}`,
        {
          twoFactorAuthenticationCode,
        },
        config
      )
      .then((data) => {
        if (data.status === 200) {
          // data
          onClose();
        }
      })
      .catch((err) => {
        console.log("err: ", err);
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
        <form>
          <input
            type="text"
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
