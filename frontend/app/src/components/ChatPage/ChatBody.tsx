import React from 'react';
import { useNavigate } from 'react-router-dom';
import "./chatPageStyle/chat.css";

interface Message {
  id: number;
  name: string;
  text: string;
}

interface ChatBodyProps {
  messages: Message[];
}

const ChatBody: React.FunctionComponent<ChatBodyProps> = ({ messages }) => {
  const navigate = useNavigate();

  const handleLeaveChat = () => {
    localStorage.removeItem('userName'); // localstorage vs database
    navigate('/');
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
          message.name === localStorage.getItem('userName') ? (
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
