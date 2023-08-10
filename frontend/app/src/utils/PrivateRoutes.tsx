import React, { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { getToken, getUser } from "./Utils";
import { get } from "http";
import PopUp2faValidate from "../components/Profile/PopUp2faValidate";
import { User } from "../components/ChatPage/PropUtils";

interface UserProps {
  id: string;
  username: string;
  is_2fa_enabled: boolean;
}

const PrivateRoutes = () => {
  const token: string = getToken("jwtToken");
  const [isTokenValid, setTokenValid] = useState<boolean | null>(null);
  const [togglePopUp, setTogglePopUp] = useState<boolean>(false);
  const [is_2fa_enabled, setIs_2fa_enabled] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<UserProps | null>(null);
  const [render, setRender] = useState<boolean>(false);

  useEffect(() => {
    const createUser = async () => {
      const user: any = await getUser(token);
      console.log("user: ", user);
      setIs_2fa_enabled(user.data.is_2fa_enabled);
      console.log("is_2fa_enabled: ", is_2fa_enabled);
      // const user2: UserProps = user.data;
      // // userInfo = user2;
      // console.log("user2: ", user2);
      // console.log("user.data: ",user.data);
      setUserInfo(user.data);
      console.log("userInfo: ", userInfo);
      if (userInfo && userInfo.is_2fa_enabled) {
        console.log("----- HERE ----");
        setTogglePopUp(true);
      }
    };

    const verifyToken = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/auth/verifyToken",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          }
        );
        const data = await response.json();

        console.log("data: ", data);
        setTokenValid(data);
        await createUser();
        console.log("userInfo: ", userInfo);
      } catch (error) {
        console.error("Error verifying token:", error);
        setTokenValid(false);
      }
    };

    verifyToken();

    // if (userInfo === null) {
    //   setRender(!render);
    // }
  }, [render]);

  const handlePopUp = () => {
    setTogglePopUp(!togglePopUp);
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
