import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Socket } from "socket.io-client";
import "./chatPageStyle/chat.css";
import { jwtVerify } from "jose";

interface GetUserNameProps {
  socket: Socket;
}

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

// async function verifyToken(token: string): Promise<void> {

// 	const secret: JsonWebKey = {
// 		kty: 'oct',
// 		k: 'alsosecret',
// 	};

// 	const secretUint8Array = new TextEncoder().encode(JSON.stringify(secret));
// 	const decodedToken = await jwtVerify(token, secretUint8Array).then(decodedToken => {
// 		console.log("Im herer: ", decodedToken);
// 	}).catch(error => {
// 		console.error(error);
// 	});
// }

function GetUserName({ socket }: GetUserNameProps) {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  // const token: string = getToken("jwtToken");
  // console.log("token : " + token);

  // console.log("decodedToken: ", decodedToken);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    localStorage.setItem("userName", userName);
    console.log("username:", userName);
    //sends the username and socket ID to the Node.js server
    socket.emit("newUser", { userName, socketID: socket.id });
    navigate("/chatPage");
  };

  return (
    <>
      <div className="container">
        <h2>Sign in to Open the Chat</h2>
        <form onSubmit={handleSubmit}>
          {/* <label htmlFor="username">Username</label> */}
          <input
            type="text"
            name="username"
            id="username"
            className="usernameInput"
            placeholder="username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <button className="button">SIGN IN</button>
        </form>
      </div>
    </>
  );
}

export default GetUserName;
