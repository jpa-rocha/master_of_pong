import axios from "axios";
import jwt from "jwt-decode";

axios.defaults.baseURL = process.env.REACT_APP_BACKEND;

interface User {
  id: string;
  username: string;
  is_2fa_enabled: boolean;
}

export interface Token {
  id: string;
  is_2fa_enabled: boolean;
  is_validated: boolean;
}

interface JwtToken {
  id: string;
  is_2fa_enabled: boolean;
  is_validated: boolean;
  iat: number;
  exp: number;
}

export function getToken(tokenName: string): string {
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(tokenName + "=")) {
      return cookie.substring(tokenName.length + 1);
    }
  }
  return "";
}

export async function getUserID(token: string): Promise<string> {
  try {
    const id = await axios.post("api/auth/getUserID", { token });
    return id.data;
  } catch (error) {
    console.error("Error getting user id", error);
    throw new Error("Failed to get user id");
    // return "";
  }
}

export async function getUser(token: string): Promise<User> {
  let user: User;
  try {
    const id = await axios
      .post("api/auth/getUserID", { token })
      .then((res) => res.data);
    user = await axios.get(`api/users/${id}`);
    return user;
  } catch (error) {
    console.error("Error getting user", error);
    window.location.reload();
    return (user = { id: "", username: "", is_2fa_enabled: false });
  }
}

export function decodeToken(coded: string): Token | null {
  if (coded !== "") {
    const token_full: JwtToken = jwt(coded);
    const token: Token = {
      id: token_full.id,
      is_2fa_enabled: token_full.is_2fa_enabled,
      is_validated: token_full.is_validated,
    };
    return token;
  }
  return null;
}

export const AxiosConfig = {
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": process.env.REACT_APP_FRONTEND,
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    [process.env.REACT_APP_JWT_NAME as string]: getToken(
      process.env.REACT_APP_JWT_NAME as string
    ),
  },
  credentials: "include",
};

// const config = {
//   withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",
//     "Access-Control-Allow-Origin": process.env.REACT_APP_FRONTEND,
//     "Access-Control-Allow-Methods":
//       "GET, POST, PUT, PATCH, DELETE, OPTIONS",
//     "Access-Control-Allow-Headers": "Content-Type, Authorization",
//     "Access-Control-Allow-Credentials": "true",
//     [process.env.REACT_APP_JWT_NAME as string] : getToken(process.env.REACT_APP_JWT_NAME as string),
//   },
//   credentials: "include",
// };
