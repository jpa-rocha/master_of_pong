import React, { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";

const PrivateRoutes = () => {
  const token: string = getToken("jwtToken");
  const [isTokenValid, setTokenValid] = useState<boolean | null>(null);

  (async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/verifyToken", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      setTokenValid(data);
    } catch (error) {
      console.error('Error verifying token:', error);
      setTokenValid(false);
    }
  })();

  return isTokenValid === null ? (
    <div>Verifying token...</div>
  ) : isTokenValid ? (
    <Outlet />
  ) : (
    <Navigate to="/" />
  );
};

export default PrivateRoutes;

function getToken(tokenName: string): string {
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(tokenName + "=")) {
      return cookie.substring(tokenName.length + 1);
    }
  }
  return "";
}