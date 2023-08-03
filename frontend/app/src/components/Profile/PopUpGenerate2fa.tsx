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
};

interface User {
  id: string;
  username: string;
}

const PopUpGenerate2fa: React.FC<PopUpGenerate2fa> = ({ isOpen, onClose }) => {
  const [qrCode, setQrCode] = useState<string>();
  const [userID, setUserID] = React.useState<string | undefined>();
  const [codeValue, setCodeValue] = useState<string>("");

  useEffect(() => {
    (async () => {
      const token = getToken("jwtToken");
      async function getUserID() {
        const id = await axios.post("api/auth/getUserID", { token });
        setUserID(id.data);
      }
      await getUserID();
      if (!userID) return;
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
    const res = await axios
      .post(`/api/2fa/turn-on/${userID}`, {
        twoFactorAuthenticationCode,
      })
      .then((res) => {
        console.log("res: ", res);
        onClose();
      })
      .catch((err) => {
        console.log("err: ", err);
        // onClose();
      });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      // setCodeValue(event.currentTarget.value);
      event.preventDefault();
      handle2faTurnOn(event.currentTarget.value, event);
      event.currentTarget.value = "";
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div>
        <h1 className="styleHeader"> 2Fa </h1>
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
// export default {};
