import React, { useState, useEffect } from "react";
import { Socket } from "socket.io-client";
import "./chatPageStyle/chat.css";

interface User {
  socketID: string;
  username: string;
  isFriend: boolean;
  status: string;
}

interface ChatBarProps {
  socket: Socket;
}

const ChatBar: React.FunctionComponent<ChatBarProps> = ({ socket }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [render, setRender] = useState<boolean>(false);

  socket.on("user disconnected", () => {
    console.log("INSIDE user disconnect");
    if (render !== true) setRender(true);
    else setRender(false);
  });

  socket.on("NewConnection", () => {
    console.log("INSIDE user connected");
    if (render !== true) setRender(true);
    else setRender(false);
  });

  useEffect(() => {
    socket.on("newUserResponse", (data) => {
      setUsers(data);
      console.log("Data");
      console.log(data);
      console.log("User BAR users: ");
      console.log(users);
    });
    socket.emit("newUser");
  }, [render]);

  useEffect(() => {
    console.log("Users changed");
  }, [users]);

  return (
    <>
      <div className="chatSidebar">
        <h2>Chat Bar</h2>
        <div className="activeUsers">
          <h4 className="chatHeader">Online</h4>
          <div className="onlineUsers">
            <ul>
              {users.map((user) => (
                <div key={user.username}>
                  {user.isFriend && user.status === "online"
                    ? `${user.username}`
                    : null}
                </div>
              ))}
            </ul>
          </div>
        </div>

        <div className="allUsers">
          <h4 className="chatHeader">Friends</h4>
          <div className="chatUsers">
            {users.map((user) => (
              <div key={user.username}>
                {user.isFriend && user.status === "offline"
                  ? `${user.username}`
                  : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatBar;
