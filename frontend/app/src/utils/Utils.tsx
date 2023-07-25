import axios from "axios";
import { Socket } from "socket.io-client";

axios.defaults.baseURL = "http://localhost:5000/";

interface User {
  id: string;
  username: string;
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
    const id = await axios
      .post("api/auth/getUserID", { token })
      .then((res) => res.data);
    return id;
  } catch (error) {
    console.error("Error getting user id");
    return "";
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
    return (user = { id: "", username: "" });
  }
}
