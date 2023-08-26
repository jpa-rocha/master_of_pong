import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { getToken } from "../../utils/Utils";

axios.defaults.baseURL = process.env.REACT_APP_BACKEND;
axios.defaults.withCredentials = true;

type PopUpGenerate2faProps = {
  isOpen: boolean;
  onClose: () => void;
  userID: string | undefined;
};

/* interface User {
  id: string;
  username: string;
} */

const PopUpGenerate2fa: React.FC<PopUpGenerate2faProps> = ({
  isOpen,
  onClose,
  userID,
}) => {
  const [qrCode, setQrCode] = useState<string>();
  const generate = useRef(true);
  // useEffect(() => {
  //   console.log("IM HERE")
  //     if (generate.current) {
  //       generate.current = false;
  //       (async () => {
  //         const getQrCode = await axios.post(
  //           `/api/2fa/generate/${userID}`,
  //           {},
  //           { responseType: "arraybuffer" }
  //         );
  //         const imageSrc = `data:image/png;base64,${btoa(
  //           new Uint8Array(getQrCode.data).reduce(
  //             (data, byte) => data + String.fromCharCode(byte),
  //             ""
  //           )
  //         )}`;

  //         setQrCode(imageSrc);
  //       })();
  //     }

  // }, []);
  useEffect(() => {
    if (generate.current) {
      generate.current = false;
      (async () => {
        try {
          console.log("IM at the begining");
          const response = await axios.post(
            `/api/2fa/generate/${userID}`,
            {},
            { responseType: "arraybuffer" }
          );

          const imageBlob = new Blob([response.data], { type: "image/png" });
          const imageSrc = URL.createObjectURL(imageBlob);

          setQrCode(imageSrc);
        } catch (error) {
          console.error("Error generating QR code:", error);
        }
      })();
    }
  }, [userID]);

  const handle2faTurnOn = async (
    twoFactorAuthenticationCode: string,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    const config = {
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
        `${process.env.REACT_APP_BACKEND}/api/2fa/turn-on/${userID}`,
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
  console.log(qrCode);
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
