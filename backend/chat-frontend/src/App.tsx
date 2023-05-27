import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import MessageInput from "./MessageInput";
import Message from "./Messages";
import "./App.css";

// const socket = io("http://localhost:8001");

function App() {
  const [socket, setSocket] = useState<Socket>();
  const [messages, setMessages] = useState<string[]>([]);

  const sendMessage = (message: string) => {
    socket?.emit("message", message);
  };

  const handleNewMessage = (newMessage: string) => {
    setMessages([...messages, newMessage]);
  };

  useEffect(() => {
    const newSocket = io("http://localhost:8001");
    setSocket(newSocket);
  }, [setSocket]);

  useEffect(() => {
    socket?.on("message", handleNewMessage);
    return () => {
      socket?.off("message", handleNewMessage);
    };
  }, [handleNewMessage]);

  // useEffect(() => {
  //   socket?.on("message", handleNewMessage);
  //   return () => {
  //     socket?.off("message", handleNewMessage);
  //   };
  // }, [handleNewMessage]);

  /*   
    // Use connected with ID
    useEffect(() => {
    socket?.on("user connected", (userId: string) => {
      setMessages([...messages, `User ${userId} connected`]);
    });
    socket?.on("user disconnected", (userId: string) => {
      setMessages([...messages, `User ${userId} disconnected`]);
    });
  }, [messages]); */

  useEffect(() => {
    socket?.on("user connected", () => {
      setMessages([...messages, `User connected`]);
    });
    socket?.on("user disconnected", () => {
      setMessages([...messages, `User disconnected`]);
    });
  }, [messages]);

  return (
    <>
      <MessageInput send={sendMessage} />
      <Message messages={messages} />
    </>
  );
}

export default App;
