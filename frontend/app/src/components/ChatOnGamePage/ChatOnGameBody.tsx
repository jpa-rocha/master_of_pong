import React from 'react'
import { useNavigate } from 'react-router-dom';
import './chatGameStyle/chatWindow.css'

interface Message {
	id: number;
	name: string;
	text: string;
  }
  
  interface ChatBodyProps {
	messages: Message[];
}

const ChatOnGameBody: React.FunctionComponent<ChatBodyProps> = ({ messages }) => {
	const navigate = useNavigate();

	const handleLeaveChat = () => {
	  localStorage.removeItem('userName'); // localstorage vs database
	  navigate('/');
	  //window.location.reload();
	};
  
	return (
	  <div className='chatWindowMainContainer'>
		<header className="chatWindowMainHeader">
		  <p>Chat and Play</p>
		  <button className="windowLeaveChatBtn" onClick={handleLeaveChat}>
			Leave Chat
		  </button>
		</header>
  
		<div className="windowMessageContainer">
		  {messages.map((message) =>
			message.name === localStorage.getItem('userName') ? (
			  <div className="windowMessageChats" key={message.id}>
				<p className="windowSenderName">You</p>
				<div className="windowMessageSender">
				  <p>{message.text}</p>
				</div>
			  </div>
			) : (
			  <div className="windowMessageChats" key={message.id}>
				<p>{message.name}</p>
				<div className="windowMessageRecipient">
				  <p>{message.text}</p>
				</div>
			  </div>
			)
		  )}
	  <div className="windowTyping">
			<p>Someone is typing...</p>
		  </div> 
		</div>
	  </div>
	);
}

export default ChatOnGameBody