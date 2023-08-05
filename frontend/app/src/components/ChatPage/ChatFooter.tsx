import React, { useState } from "react";
import { Socket } from "socket.io-client";
import { useEffect } from "react";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:5000/";

interface ChatFooterProps {
  socket: Socket;
}

interface ChatProp {
  id: number;
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
      const handleReturnChat = (chat: ChatProp) => {
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
     {/*  {chatID ? ( */}
		<form onSubmit={handleSendMessage}>
	<div className="flex flex-row items-center h-16 rounded-xl bg-white w-full px-4">
		 <div className="flex-grow ml-4">
			 <div className="relative w-full">
			   <input
			    value={message}
				onChange={(e) => setMessage(e.target.value)}
				 type="text"
				 className="flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 pl-4 h-10"
			   />
			   <button className="absolute flex items-center justify-center h-full w-12 right-0 top-0 text-gray-400 hover:text-gray-600">
				 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
				   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				 </svg>
			   </button>
			 </div>
		 </div>
		 <div className="ml-4">
			 <button className="flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-4 py-1 flex-shrink-0">
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
    </>
  );
};

export default ChatFooter;
