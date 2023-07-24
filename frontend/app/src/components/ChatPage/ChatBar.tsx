import React, { useState, useEffect } from "react";
import { Socket } from "socket.io-client";
import "./chatPageStyle/chat.css";

interface User {
  socketID: string;
  username: string;
}

interface ChatBarProps {
  socket: Socket;
}

const ChatBar: React.FunctionComponent<ChatBarProps> = ({ socket }) => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    socket.on("newUserResponse", (data: User[]) => {
      setUsers(data);
	  console.log("Data");
	  console.log(data);
      console.log("User BAR users: ");
	  console.log(users);
    });
  }, [socket]);

  return (
    <>
      <div className="chatSidebar">
        <h2>Chat Bar</h2>
        <div className="activeUsers">
          <h4 className="chatHeader">Online</h4>
          <div className="onlineUsers">
            <ul>
              {users.map((user) => (
                <li key={user.socketID}>{user.socketID}</li>
              ))}
            </ul>
            {/* {users.map((user) => (
            <p key={user.socketID}>{user.username}</p>
          ))} */}
          </div>
        </div>
        {/* <div className="allUsers">
        <h4 className="chatHeader">Friends</h4>
        <div className="chatUsers">
          instead of socketID, need friendsID
          {users.map((user) => (
            <p key={user.socketID}>{user.username}</p>
          ))}
        </div>
      </div> */}
      </div>
    </>
  );
};

export default ChatBar;
