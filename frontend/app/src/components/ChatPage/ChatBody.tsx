import React, { useEffect, useState } from "react";
import { getToken } from "../../utils/Utils";
import axios from "axios";
import { Socket } from "socket.io-client";
import BannedUsersPopUp from "./PopUpBannedUsers";
import PopUpPassword from "./PopUpPassword";
import { Message, User, Chat } from "./PropUtils";

axios.defaults.baseURL = "http://localhost:5000/";

interface ChatBodyProps {
  socket: Socket;
}

interface ChatMessagesResult {
  chatID: number;
  messages: Message[];
}

const ChatBody: React.FunctionComponent<ChatBodyProps> = ({ socket }) => {
  const [user, setUser] = useState<User>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chat, setChat] = useState<Chat>();

  const [isBannedPopupOpen, setIsBannedPopupOpen] = useState(false);
  const [isPasswordPopupOpen, setIsPasswordPopupOpen] = useState(false);

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
    };
    getUserEffect();

    const handleReturnChatBody = (chat: Chat) => {
      if (chat && chat.id) {
        setChat(chat);
        socket.emit("getMessages", { chatID: chat.id });
      }
    }

    const handleReturnMessages = (data: ChatMessagesResult) => {
      if (chat && chat?.id === data.chatID)
        setMessages(data.messages);
    }

    socket.on("returnChat", handleReturnChatBody);
    socket.on("message", handleReturnMessages);
    return () => {
      socket.off("message", handleReturnMessages);
      socket.off("returnChat", handleReturnChatBody);
    };
  }, [messages, user?.username, socket, chat]);

  useEffect(() => {
    if (chat?.id && user?.username && chat.title === 'direct') {
      if (user.username === chat.users[0].username && chat.users[1].username)
        chat.title = chat.users[1].username;
      else if (chat.users[0].username)
        chat.title = chat.users[0].username;
    }
  }, [chat, user]);

  const messageContainer = document.querySelector(".messageContainer");
  if (messageContainer) {
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }

  const handleLeaveChat = () => {
    socket.emit('leaveChat', {chatID: chat?.id})
    document.location.reload();
  };

  const togglePopup = () => {
    setIsBannedPopupOpen(!isBannedPopupOpen);
  }

  const togglePopupPassword = () => {
    setIsPasswordPopupOpen(!isPasswordPopupOpen);
  }

  return (
    <>
    <div>
      <header className="ml-2 font-bold text-2xl flex items-center">
        <h1>{chat?.title}</h1>
        {chat?.channel !== "direct" ? (
          <div>
            <button onClick={() => handleLeaveChat()} className="relative ml-3 text-sm bg-indigo-100 py-2 px-4 shadow rounded-xl">
              Leave
            </button>
            <button onClick={() => togglePopup()} className="relative ml-3 text-sm bg-indigo-100 py-2 px-4 shadow rounded-xl">
              Banned Users
            </button>
            {user?.id === chat?.creator.id ? (
              <button onClick={() => togglePopupPassword()} className="relative ml-3 text-sm bg-indigo-100 py-2 px-4 shadow rounded-xl">
                Manage Password
              </button>
            ): null}
          </div>
        ) : null}
      </header>
    </div>

    <div className="flex flex-col h-full overflow-x-auto mb-4">
      <div className="flex flex-col h-full">

  
        <div className="grid grid-cols-12 gap-y-2">
          {messages &&
            messages.map((message) =>
              message.sender.username === user?.username ? (
                <div className="col-start-1 col-end-8 p-3 rounded-lg" key={message.id}>
                  <div className="flex flex-row items-center">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0">You</div>
                      <div>
                        <div className="text-sm text-center">{message.sender.username}</div>
                        <div className="relative ml-3 text-sm bg-white py-2 px-4 shadow rounded-xl">
                          {message.content}
                        </div>
                      </div>
                  </div>
                </div>
              ) : (
                <div className="col-start-6 col-end-13 p-3 rounded-lg" key={message.id}>
                  <div className="flex flex-col">
                    <div className="flex items-center justify-start flex-row-reverse">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0"></div>
                      <div>
                        <div className="text-sm text-center">{message.sender.username}</div>
                        <div className="relative mr-3 text-sm bg-indigo-100 py-2 px-4 shadow rounded-xl">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
        </div>
      </div>
    </div>
    {isBannedPopupOpen && chat && (
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
          <BannedUsersPopUp isOpen={isBannedPopupOpen} onClose={togglePopup} socket={socket} chat={chat} />
        </div>
      )}
    {isPasswordPopupOpen && chat && user && (
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
          <PopUpPassword isOpen={isPasswordPopupOpen} onClose={togglePopupPassword} socket={socket} chat={chat} user={user} />
        </div>
      )}
    </>
  );
};

export default ChatBody;
