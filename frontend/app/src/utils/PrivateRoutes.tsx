import React, { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { getToken } from "./Utils";

const PrivateRoutes = () => {
  const token: string = getToken("jwtToken");
  const [isTokenValid, setTokenValid] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        console.log("VERIFYYYYYYYYYYYYYYYYYYYYYYYY");
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
        setTokenValid(data);
      } catch (error) {
        console.error("Error verifying token:", error);
        setTokenValid(false);
      }
    })();
  }, [token]);

  return isTokenValid === null ? (
    <div>Verifying token...</div>
  ) : isTokenValid ? (
    <Outlet />
  ) : (
    <Navigate to="/" />
  );
};

export default PrivateRoutes;
