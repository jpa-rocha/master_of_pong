import React, { useEffect, useRef, useState } from "react";
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
   <div className="flex flex-col h-full overflow-x-auto mb-4">
   <div className="flex flex-col h-full">
  {/*   {chat ? ( 
		<>
    	<header className="chatMainHeader">
        	<h1>{chat?.title}</h1>
    	</header>  */}

	<div className="grid grid-cols-12 gap-y-2">
   {/*      {messages &&
            messages.map((message) =>
              message.sender.username === user?.username ? (  */}
				<div  className="col-start-1 col-end-8 p-3 rounded-lg">
                  <div className="flex flex-row items-center">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0">You</div>
                    <div className="relative ml-3 text-sm bg-white py-2 px-4 shadow rounded-xl">
                      <div>{/* {message.content} */}
					Lorem ipsum dolor sit amet consectetur adipisicing elit. Impedit doloribus minus expedita sunt, ad maxime tenetur aspernatur vitae
					</div>
                    </div>
                  </div>
                </div>
            {/*    ) : ( */}
				<div  className="col-start-6 col-end-13 p-3 rounded-lg">
                <div className="flex items-center justify-start flex-row-reverse">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0"></div>
                  <div className="relative mr-3 text-sm bg-indigo-100 py-2 px-4 shadow rounded-xl">
                    <div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Impedit doloribus minus expedita sunt</div>
                  </div>
                </div>
            	</div>
		{/* 	)
			)
		} */}
{/* 	</> */}
    {/* ): null}  */}
    </div>
    </div>
    </div>
  );
};

export default ChatBody;
