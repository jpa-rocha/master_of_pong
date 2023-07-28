import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./chatPageStyle/chat.css";
import { getToken } from "../../utils/Utils";
import axios from "axios";
import { Socket } from "socket.io-client";

axios.defaults.baseURL = "http://localhost:5000/";

interface Message {
  id: number;
  sender: UserProps;
  content: string;
}

interface ChatMessagesResult {
  chatID: number;
  messages: Message[];
}

interface ChatBodyProps {
  socket: Socket;
}

interface User {
  socketID: string;
  username: string;
  isFriend: boolean;
  status: string;
  id: string;
}

interface ChatProp {
  id: number;
  title: string;
  channel: string;
  users: User[];
}

interface UserProps {
  forty_two_id: number;
  username: string | undefined;
  refresh_token: string;
  email: string;
  avatar: string;
  is_2fa_enabled: boolean;
  xp: number;
  id: string;
}

const ChatBody: React.FunctionComponent<ChatBodyProps> = ({ socket }) => {
  const [user, setUser] = useState<UserProps>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chat, setChat] = useState<ChatProp | undefined>(undefined);

  socket.on("message", (data: ChatMessagesResult) => {
    if (chat && chat?.id === data.chatID) {
      // console.log("Current chat id = ", chat.id);
      // console.log("CHAT ID = ", chat.id);
      setMessages(data.messages);
    }
  });

  socket.on("returnDirectChat", (chat: ChatProp) => {
    if (chat.id) {
      console.log("Received CHAT ID = ", chat.id);
      setChat(chat);
      socket.emit("getMessages", { chatID: chat.id });
    }
  });

  useEffect(() => {
    const getUser = async () => {
      const token = getToken("jwtToken");
      const id = await axios
        .post("api/auth/getUserID", { token })
        .then((res) => res.data);
      const user = await axios.get(`api/users/${id}`);

      return user.data;
    };

    const getUserEffect = async () => {
      const temp = await getUser();
      if (temp) {
        setUser(temp);
      }
      console.log("User = " + user?.username);
    };
    getUserEffect();
    return () => {
      socket.off("message");
      socket.off("returnDirectChat");
    };
  }, [messages, user?.username, socket]);

  useEffect(() => {
    if (chat?.id && user?.username && chat.title === 'direct') {
      if (user.username === chat.users[0].username)
        chat.title = chat.users[1].username;
      else 
        chat.title = chat.users[0].username;
    }
  }, [chat, user]);

  const messageContainer = document.querySelector(".messageContainer");
  if (messageContainer) {
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }

  return (
    <div className="chatMainContainer">
      {chat ? (
        <>
          <header className="chatMainHeader">
            <h1>{chat?.title}</h1>
          </header>

          <div className="messageContainer">
            {messages &&
              messages.map((message) =>
                message.sender.username === user?.username ? (
                  <div className="messageChats" key={message.id}>
                    <p className="senderName">You</p>
                    <div className="messageSender">
                      <p>{message.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="messageChats" key={message.id}>
                    <p>{message.sender.username}</p>
                    <div className="messageRecipient">
                      <p>{message.content}</p>
                    </div>
                  </div>
                )
              )}
          </div>
        </>
      ): null}
    </div>
  );
};

export default ChatBody;
