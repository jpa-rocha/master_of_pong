import React from 'react'
import { useState } from 'react';
import { Socket } from 'socket.io-client';
import './chatGameStyle/chatWindow.css'


interface ChatFooterProps {
	socket: Socket;
  }

const ChatOnGameFooter: React.FunctionComponent<ChatFooterProps> = ({ socket }) => {
	const [message, setMessage] = useState('');

	const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
	  e.preventDefault();
	  if (message.trim() && localStorage.getItem('userName')) {
		socket.emit('message', {
		  text: message,
		  name: localStorage.getItem('userName'),
		  id: `${socket.id}${Math.random()}`,
		  socketID: socket.id,
		});
	  }
	  setMessage('');
	};
  
	const handleTyping = (): void => {
	  const typingElement = document.querySelector(".windowTyping") as HTMLElement | null;
	  if (typingElement)
	  {
		  typingElement.classList.toggle("active");
			setTimeout(() => {
			  typingElement.classList.toggle("active");
		  }, 1000);
	  }
	};
	
  
	return (
	  <div className="chatWindowFooter">
		<form className="chatWindowForm" onSubmit={handleSendMessage}>
		  <input
			type="text"
			placeholder="Write message"
			className="chatWindowMessage"
			value={message}
			onChange={(e) => setMessage(e.target.value)}
			onKeyDown={handleTyping}
		  />
		  <button className="windowSendBtn">SEND</button>
		</form>
	  </div>
	);
}

export default ChatOnGameFooter