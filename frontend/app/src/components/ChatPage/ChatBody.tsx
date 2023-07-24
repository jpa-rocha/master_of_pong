import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./chatPageStyle/chat.css";
import { getToken } from '../../utils/Utils';
import axios from "axios";

axios.defaults.baseURL = "http://localhost:5000/";

interface Message {
  id: number;
  name: string;
  text: string;
}

interface ChatBodyProps {
  messages: Message[];
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

const ChatBody: React.FunctionComponent<ChatBodyProps> = ({ messages }) => {
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
    };
    getUserEffect();
  }, []);

  const navigate = useNavigate();

  const handleLeaveChat = () => {
    // localStorage.removeItem('userName'); // localstorage vs database
    navigate('/main');
    //window.location.reload();
  };

  return (
    <div className='chatMainContainer'>
      <header className="chatMainHeader">
        <p>Chit Chat Time</p>
        <button className="leaveChatBtn" onClick={handleLeaveChat}>
          Leave Chat
        </button>
      </header>

      <div className="messageContainer">
        {messages.map((message) =>
          message.name === user?.username ? (
            <div className="messageChats" key={message.id}>
              <p className="senderName">You</p>
              <div className="messageSender">
                <p>{message.text}</p>
              </div>
            </div>
          ) : (
            <div className="messageChats" key={message.id}>
              <p>{message.name}</p>
              <div className="messageRecipient">
                <p>{message.text}</p>
              </div>
            </div>
          )
        )}
    <div className="typing">
          <p>Someone is typing...</p>
        </div> 
      </div>
    </div>
  );
};

export default ChatBody;
