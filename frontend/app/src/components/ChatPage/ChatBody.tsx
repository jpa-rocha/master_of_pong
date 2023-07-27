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
      console.log("CHAT ID = ", chat.id);
      // console.log("Current chat ID : ", chat?.id);
      // console.log("Got this chat   : ", data.chatID);
      setMessages(data.messages);
    }
  });

  socket.on("returnDirectChat", (chat: ChatProp) => {
    if (chat.id) {
      console.log("Returned CHAT id = ", chat.id);
      setChat(chat);
    }
  });

  const getUser = async () => {
    const token = getToken("jwtToken");
    const id = await axios
      .post("api/auth/getUserID", { token })
      .then((res) => res.data);
    const user = await axios.get(`api/users/${id}`);

    return user.data;
  };
  useEffect(() => {
    const getUserEffect = async () => {
      setUser(await getUser());
      console.log("User = " + user?.username);
    };
    console.log("Messages in socket event = ", messages);
    getUserEffect();
  }, []);

  const navigate = useNavigate();

  const handleLeaveChat = () => {
    // localStorage.removeItem('userName'); // localstorage vs database
    navigate("/main");
    //window.location.reload();
  };

  return (
    <div className="chatMainContainer">
      <header className="chatMainHeader">
        <p>&{chat?.id}</p>
        <button className="leaveChatBtn" onClick={handleLeaveChat}>
          Leave Chat
        </button>
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
        <div className="typing">
          <p>Someone is typing...</p>
        </div>
      </div>
    </div>
  );
};

export default ChatBody;
