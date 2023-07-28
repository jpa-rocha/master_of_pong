import React, { useState } from "react";
import { Socket } from "socket.io-client";
import "./chatPageStyle/chat.css";
import { getToken, getUser } from "../../utils/Utils";
import { useEffect } from "react";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:5000/";

interface ChatFooterProps {
  socket: Socket;
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

interface ChatProp {
  id: number;
}

const ChatFooter: React.FunctionComponent<ChatFooterProps> = ({ socket }) => {
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<UserProps>();
  const [chatID, setChatID] = useState<number>(0);
  // let user: UserProps;

  socket.on("returnDirectChat", (chat: ChatProp) => {
    if (chat.id) {
      setChatID(chat.id);
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
      const user = await getUser();
      setUser(user);
      socket.emit("newUser");
    };
    getUserEffect();
  }, [socket]);

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket.emit("sendMessage", { chatID: chatID, message: message });
    setMessage("");
  };

  const handleTyping = (): void => {
    const typingElement = document.querySelector(
      ".typing"
    ) as HTMLElement | null;
    if (typingElement) {
      typingElement.classList.toggle("active");
      setTimeout(() => {
        typingElement.classList.toggle("active");
      }, 1000);
    }
  };

  return (
    <>
      {chatID ? (
      <div className="chatFooter">
        <form className="chatForm" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Write message"
            className="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleTyping}
          />
          <button className="sendBtn">SEND</button>
        </form>
      </div>
      ): null}
    </>
  );
};

export default ChatFooter;
