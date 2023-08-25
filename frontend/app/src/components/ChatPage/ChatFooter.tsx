import React, { useState } from "react";
import { Socket } from "socket.io-client";
import { useEffect } from "react";
import axios from "axios";
import { Chat } from "./PropUtils";

axios.defaults.baseURL = process.env.REACT_APP_BACKEND;

interface ChatFooterProps {
  socket: Socket;
}

const ChatFooter: React.FunctionComponent<ChatFooterProps> = ({ socket }) => {
  const [message, setMessage] = useState("");
  const [chatID, setChatID] = useState<number>(0);

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message !== "")
      socket.emit("sendMessage", { chatID: chatID, message: message });
    setMessage("");
  };

    useEffect(() => {
      const handleReturnChat = (chat: Chat) => {
        if (chat && chat.id)
        setChatID(chat.id);
      }

      socket.on("returnChatFooter", handleReturnChat);
      return () => {
        socket.off("returnChatFooter", handleReturnChat);
      };
    }, [socket]);

  return (
    <>
	{chatID ? (
		<div>
			<form onSubmit={handleSendMessage}>
		<div className="flex flex-row items-center h-16 rounded-xl bg-yellow-50 w-full px-4">
			<div className="flex-grow ml-4">
				<div className="relative w-full">
				<input
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					type="text"
					className="flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 pl-4 h-10"
				/>
				</div>
			</div>
			<div className="ml-4">
				<button className="flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-4 py-2 flex-shrink-0">
				<span>Send</span>
				<span className="ml-2">
					<svg className="w-4 h-4 transform rotate-45 -mt-px" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
					</svg>
				</span>
				</button>
			</div>

		</div>
		</form>
		</div>
	):null}
    </>
  );
};

export default ChatFooter;
