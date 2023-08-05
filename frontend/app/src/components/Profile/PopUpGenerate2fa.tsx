import axios from "axios";
import React, { useEffect, useState } from "react";
import "./styleProfile.css";
import { getToken, getUser } from "../../utils/Utils";
import { get } from "http";
import fs from "fs";
import { ThemeContext } from "@emotion/react";
import { on } from "events";

axios.defaults.baseURL = "http://localhost:5000/";

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
      console.log("userID: ", userID);
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
    console.log("value: ", twoFactorAuthenticationCode);
    const config = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://localhost:3000",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
        jwtToken: getToken("jwtToken"),
      },
    };
    const res = await axios
      .post(
        `/api/2fa/turn-on/${userID}`,
        {
          twoFactorAuthenticationCode,
        },
        config
      )
      .then((data) => {
        console.log("res: ", data);
        if (data.status === 200) {
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
      <div>
        <h1 className="styleHeader"> 2fa </h1>
        <h2 className="styleHeader">
          <img src={qrCode} alt="QR Code" />
        </h2>
        <form>
          <input
            type="text"
            placeholder="Enter 2fa Code"
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

export default PopUpGenerate2fa;
