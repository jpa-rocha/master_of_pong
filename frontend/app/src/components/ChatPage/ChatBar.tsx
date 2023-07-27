import React, { useState, useEffect } from "react";
import { Socket } from "socket.io-client";
import "./chatPageStyle/chat.css";
import axios from "axios";
import { getToken } from "../../utils/Utils";

axios.defaults.baseURL = "http://localhost:5000/";

interface User {
  socketID: string;
  username: string;
  isFriend: boolean;
  status: string;
  id: string;
}

interface ChatBarProps {
  socket: Socket;
}

interface ChatProp {
  id: number;
  users: User[];
}

const ChatBar: React.FunctionComponent<ChatBarProps> = ({ socket }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [render, setRender] = useState<boolean>(false);
  const [userID, setUserID] = useState<string | undefined>(undefined);
  const [chat, setChat] = useState<ChatProp | undefined>(undefined);
  const token: string = getToken("jwtToken");

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

  socket.on("returnDirectChat", (chat: ChatProp) => {
    if (chat.id) {
      console.log("Returned CHAT id = ", chat.id);
      socket.emit("getMessages", { chatID: chat.id });
      setChat(chat);
    }
  });

  useEffect(() => {
    async function getUsersID() {
      const id = await axios.post("api/auth/getUserID", { token });
      setUserID(id.data);
    }
    getUsersID();
    socket.on("newUserResponse", (data) => {
      setUsers(data);
      // console.log("Data");
      // console.log(data);
      // console.log("User BAR users: ");
      // console.log(users);
    });
    socket.emit("newUser");
  }, [render]);

  useEffect(() => {
    console.log("Users changed");
  }, [users]);

  function handleGetChat(user: User) {
    console.log("INSIDE handleGetChat");
    console.log(user);
    socket.emit("getDirectChat", { user1ID: userID, user2ID: user.id });
  }

  return (
    <>
      <div className="chatSidebar">
        <h2>Chat Bar</h2>
        <div className="activeUsers">
          <h4 className="chatHeader">Online</h4>
          <div className="onlineUsers">
            <ul>
              {users.map((user) => (
                <button key={user.username} onClick={() => handleGetChat(user)}>
                  {user.isFriend && user.status === "online"
                    ? `${user.username}`
                    : null}
                </button>
              ))}
            </ul>
          </div>
        </div>

        <div className="allUsers">
          <h4 className="chatHeader">Friends</h4>
          <div className="chatUsers">
            {users.map((user) => (
              <button key={user.username}>
                {user.isFriend && user.status === "offline"
                  ? `${user.username}`
                  : null}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatBar;
