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

const ChatFooter: React.FunctionComponent<ChatFooterProps> = ({ socket }) => {
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<UserProps>();
  // let user: UserProps;

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
      socket.emit("newUser", { username: user?.username, socketID: socket.id });
    };
    getUserEffect();
  }, []);

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("handleSendMessage = " + user?.username);
    console.log(socket.id);
    if (message.trim() && user?.username) {
      socket.emit("message", {
        text: message,
        name: user?.username,
        id: `${socket.id}${Math.random()}`,
        socketID: socket.id,
      });
    }
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
  );
};

export default ChatFooter;
