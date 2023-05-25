import { useEffect, useState } from "react";
import "./App.css";
import io, { Socket } from "socket.io-client";
import MessageInput from "./MessageInput";
import Message from "./Messages";

function App() {
  const [socket, setSocket] = useState<Socket>();
  const [messages, setMessages] = useState<string[]>([]);

  const sendMessage = (message: string) => {
    socket?.emit("message", message);
  };

  useEffect(() => {
    const newSocket = io("http://localhost:8001");
    setSocket(newSocket);
  }, [setSocket]);

  const handleNewMessage = (newMessage: string) => {
    setMessages([...messages, newMessage]);
  };

  useEffect(() => {
    socket?.on("message", handleNewMessage);
    return () => {
      socket?.off("message", handleNewMessage);
    };
  }, [handleNewMessage]);

  return (
    <>
      {" "}
      <ul id="messages"></ul>
      <MessageInput send={sendMessage} />
      <Message messages={messages} />
    </>
  );
}

export default App;
