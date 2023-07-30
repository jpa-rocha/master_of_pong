import React, { useState } from "react";
import { Socket } from "socket.io-client";
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
  {/*     ): null} */}
    </>
  );
};

export default ChatFooter;
