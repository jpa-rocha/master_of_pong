import { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { getToken, decodeToken, Token } from "./Utils";
import PopUp2faValidate from "../components/Profile/PopUp2faValidate";



const PrivateRoutes = () => {
  const token: string = getToken(process.env.REACT_APP_JWT_NAME as string);
  const [isTokenValid, setTokenValid] = useState<boolean | null>(null);
  const [togglePopUp, setTogglePopUp] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<Token | null>(null);
  //const [render, setRender] = useState<boolean>(false);

  useEffect(() => {
    const check_validation = () => {
      const decoded: Token | null = decodeToken(token)
      if (decoded !== null) {
        console.log(decoded)
        if (decoded.is_2fa_enabled === false) {
          setUserInfo(decoded)
          setTokenValid(true);
        }
        if (decoded.is_2fa_enabled === true && decoded.is_validated === false) {
          setUserInfo(decoded)
          setTogglePopUp(true);
        }
        if (decoded.is_2fa_enabled === true && decoded.is_validated === true) {
          setUserInfo(decoded)
          setTokenValid(true);
        }
      }
      else
        setTokenValid(false);
    };

    const verifyToken = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND}api/auth/verifyToken`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          }
        );
        const data = await response.json();
        check_validation();
        // setTokenValid(true);
        // this needs to be true after its checked

      } catch (error) {
        console.error("Error verifying token:", error);
        setTokenValid(false);
      }
    };
    verifyToken();
  }, [token, togglePopUp]);

  // useEffect(() => {
  // if (userInfo === null) {
  //   setRender(!render);
  // }}, [render]);

  const handlePopUp = () => {
    setTogglePopUp(!togglePopUp);
    setTokenValid(true);
  };

  return (
    <>
      {togglePopUp && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          {userInfo ? (
            <PopUp2faValidate
              isOpen={togglePopUp}
              onClose={handlePopUp}
              UserId={userInfo.id}
            />
          ) : null}
        </div>
      )}
      {isTokenValid === null ? (
        <div>Verifying token...</div>
      ) : isTokenValid ? (
        <Outlet />
      ) : (
        <Navigate to="/" />
      )}
    </>
  );
};

export default PrivateRoutes;
