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

interface ChatRoomProp {
  id: number;
  title: string;
}

const ChatBar: React.FunctionComponent<ChatBarProps> = ({ socket }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [render, setRender] = useState<boolean>(false);
  const [userID, setUserID] = useState<string | undefined>(undefined);
  const [chatRooms, setChatRooms] = useState<ChatRoomProp[]>();
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

  useEffect(() => {
    async function getUsersID() {
      const id = await axios.post("api/auth/getUserID", { token });
      setUserID(id.data);
    }
    getUsersID();
    socket.on("newUserResponse", (data: {users: User[], chatRooms: ChatRoomProp[]}) => {
      if (data.users)
        setUsers(data.users);
      if (data.chatRooms)
        setChatRooms(data.chatRooms);
      
      console.log("FRIENDS DATA: ", data.users);
    });
    // socket.emit("newUser");
  }, [socket, token]);

  useEffect(() => {
    console.log("Users changed");
  }, [users]);

  function handleGetChat(user: User) {
    // console.log("INSIDE handleGetChat");
    // console.log("user1ID = ", userID);
    // console.log("user2ID = ", user.id);
    console.log("GET DIRECT CHAT CALLED");
    socket.emit("getDirectChat", { user1ID: userID, user2ID: user.id });
  }


  function createChatRoom() {
    const chatTitle = "MasterOfPongChatPublic";
    const chatPassword = "";
    socket.emit("createChatRoom", { title: chatTitle, password: chatPassword });
  }

  function joinChatRoom() {
    const chatTitle = "MasterOfPongChatPublic";
    const chatPassword = "";
    socket.emit("joinChatRoom", { title: chatTitle, password: chatPassword });
  }

  function getChatRoomMessages(chatID: number) {
    socket.emit("getChatRoomMessages", { chatID: chatID });
  }

  return (
    <>
      <div className="chatSidebar">
        <h2>Chat Bar</h2>
        <div className="activeUsers">
          <h4 className="chatHeader">Friends</h4>
          <div className="onlineUsers">
            <ul>
              {users.map((user) => (
                <div key={user.username}>
                  {user.isFriend ? (
                    <button onClick={() => handleGetChat(user)}>
                      {user.username} {user.status}
                    </button>
                  ) : null}
                </div>
              ))}
            </ul>
          </div>
        </div>

        <div className="allUsers">
          <h4 className="chatHeader">Chat Rooms</h4>
          <button onClick={() => createChatRoom()}>
            create chatRoom
          </button>
          <button onClick={() => joinChatRoom()}>
            join chatRoom
          </button>
          <div className="chatUsers">
            <ul>
              {chatRooms && chatRooms.map((chat) => (
                <div key={chat.id}>
                    <button onClick={() => getChatRoomMessages(chat.id)}>
                      {chat.title}
                    </button>
                </div>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatBar;
