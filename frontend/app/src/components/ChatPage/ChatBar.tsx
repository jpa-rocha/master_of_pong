import React, { useState, useEffect } from "react";
import { Socket } from "socket.io-client";
import axios from "axios";
import { getToken } from "../../utils/Utils";
import PopUpCreateChat from "./PopUpCreateChat";
import PopUpJoinChat from "./PopUpJoinChat";

axios.defaults.baseURL = "http://localhost:5000/";

interface User {
  socketID: string;
  username: string;
  isFriend: boolean;
  status: string;
  id: string;
}

interface ChatBarProps {
  socket: Socket;
}

interface ChatRoomProp {
  id: number;
  title: string;
}

const ChatBar: React.FunctionComponent<ChatBarProps> = ({ socket }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [render, setRender] = useState<number>(0);
  const [userID, setUserID] = useState<string | undefined>(undefined);
  const [chatRooms, setChatRooms] = useState<ChatRoomProp[]>();
  const token: string = getToken("jwtToken");
  const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);
  const [isJoinPopupOpen, setIsJoinPopupOpen] = useState(false);

  socket.on("user disconnected", () => {
    setRender((prev) => prev + 1);
  });

  socket.on("NewConnection", () => {
    setRender((prev) => prev + 1);
  });

  socket.on("RenderChatBar", () => {
    setRender((prev) => prev + 1);
  });

  useEffect(() => {
    async function getUsersID() {
      const id = await axios.post("api/auth/getUserID", { token });
      setUserID(id.data);
    }
    getUsersID();
    socket.emit("newUser");
    socket.on("newUserResponse", (data: {users: User[], chatRooms: ChatRoomProp[]}) => {
      if (data.users)
        setUsers(data.users);
      if (data.chatRooms)
        setChatRooms(data.chatRooms);
      
      console.log("FRIENDS DATA: ", data.users);
    });

    return () => {
      socket.off("user disconnected");
      socket.off("NewConnection");
      socket.off("RenderChatBar");
      socket.off("newUserResponse")
    };
  }, [socket, token, render]);

  function handleGetChat(user: User) {
    socket.emit("getDirectChat", { user1ID: userID, user2ID: user.id });
  }

  function getChatRoomMessages(chatID: number) {
    socket.emit("getChatRoomMessages", { chatID: chatID });
  }

  function createChatRoom(chatRoomName: string, chatRoomPassword: string) {
    socket.emit("createChatRoom", { title: chatRoomName, password: chatRoomPassword });
  }

  function joinChatRoom(chatRoomName: string, chatRoomPassword: string) {
    socket.emit("joinChatRoom", { title: chatRoomName, password: chatRoomPassword });
  }

  const toggleCreatePopup = () => {
    setIsCreatePopupOpen(!isCreatePopupOpen);
  };

  const toggleJoinPopup = () => {
    setIsJoinPopupOpen(!isJoinPopupOpen);
  };

  return (
	<div className="flex flex-col py-8 pl-6 pr-2 mt-3 rounded-2xl w-64 bg-gray-100 flex-shrink-0">
	<div className="flex flex-row items-center justify-start h-3 w-full">
	  <div className="flex items-center justify-center rounded-2xl text-white bg-gray-800 h-10 w-10">
		<svg
		  className="w-6 h-6"
		  fill="none"
		  stroke="currentColor"
		  viewBox="0 0 24 24"
		  xmlns="http://www.w3.org/2000/svg"
		>
		  <path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
		  />
		</svg>
	  </div>
	  <div className="ml-2 font-bold text-2xl">Chat</div>
	</div>
  
	<div className="flex flex-col mt-8">
	  <div className="flex flex-row items-center justify-between text-xs">
		<span className="font-bold">Friends</span>
	  </div>
		  {users.map((user) => (
		  <div key={user.username} className="flex flex-col space-y-1 mt-4 -mx-2 h-48 overflow-y-auto">
			{user.isFriend ? (
		   <button onClick={() => handleGetChat(user)}
		   className="flex flex-row items-center hover:bg-gray-100 rounded-xl p-2">
			 <div className="ml-2 text-sm font-semibold">{user.username} {user.status} </div>
		   </button>
		   ) : null}
		   </div>
		))}
	 
	</div>
	<div className="flex flex-col mt-2">
	  <div className="flex flex-row items-center justify-between text-xs">
		<span className="font-bold">Chat Rooms</span>
	  </div>
	  <div className="flex flex-col space-y-1 mt-2 mx-2 h-48 overflow-y-auto">
      <div>
        <button  onClick={() => toggleCreatePopup()} className="relative mr-3 text-sm bg-indigo-100 py-2 px-4 shadow rounded-xl">
          create
        </button>
        {/* className="flex flex-row items-center hover:bg-gray-100"> */}
        <button onClick={() => toggleJoinPopup()} className="relative mr-3 text-sm bg-indigo-100 py-2 px-4 shadow rounded-xl">
          join
        </button>
      </div>
		<ul>
		{chatRooms && chatRooms.map((chat) => (
      <div key={chat.id}>
			  <button onClick={() => getChatRoomMessages(chat.id)}>
				{chat.title}
			  </button>
		  </div>
		))}
	  </ul>
	  </div>
	</div>
  {isCreatePopupOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999,
          }}
        >
          <PopUpCreateChat isOpen={isCreatePopupOpen} onClose={toggleCreatePopup} onCreateChatRoom={createChatRoom} socket={socket} />
        </div>
      )}
  {isJoinPopupOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999,
          }}
        >
          <PopUpJoinChat isOpen={isJoinPopupOpen} onClose={toggleJoinPopup} onJoinChatRoom={joinChatRoom} socket={socket} />
        </div>
      )}
</div>
    
  );
};

export default ChatBar;
