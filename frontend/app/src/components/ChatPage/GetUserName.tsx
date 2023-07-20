import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Socket } from "socket.io-client";
import "./chatPageStyle/chat.css";
// import { jwtVerify, decode } from "jose";
import axios from "axios";

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
  const [data, setData] = useState([]);

  const navigate = useNavigate();

  /* 
    1. get the token -- DONE
    2. get token is valid
    3. decode the token
    4. get user ID
    5. get info from database
    6. store user and socket ID in array
  */


  const token: string = getToken("jwtToken");
  // console.log("token : " + token);

  // console.log("decodedToken: ", decodedToken);

  const id = 1;
  

  const user = axios.get("/api/users/"+ id)
  .then( (response) => {
	console.log(response.data);
	return response.data.username;
  }).catch( (error) => {
	console.error("Invalid user:", error);
	return([]);
  });


 

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    localStorage.setItem("userName", userName);
    console.log("username:", userName);
    //sends the username and socket ID to the Node.js server
    socket.emit("newUser", { userName, socketID: socket.id });
    navigate("/chatPage");
  };

  useEffect( () => {
	
  }, []);

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