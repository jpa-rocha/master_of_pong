import React from "react";
import { useState } from "react";
import { Socket } from "socket.io-client";
import "./chatWindow.css";

interface ChatFooterProps {
  socket: Socket;
}

const ChatOnGameFooter: React.FunctionComponent<ChatFooterProps> = ({
  socket,
}) => {
  const [message, setMessage] = useState("");

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message.trim() && localStorage.getItem("userName")) {
      socket.emit("message", {
        text: message,
        name: localStorage.getItem("userName"),
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

export default ChatOnGameFooter;
