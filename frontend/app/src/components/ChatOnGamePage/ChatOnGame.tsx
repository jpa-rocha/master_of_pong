import React from 'react';
import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import ChatonGameBody from './ChatOnGameBody';
import ChatonGameFooter from './ChatOnGameFooter';
import './chatGameStyle/chatWindow.css'


interface ChatOnProps {
	socket: Socket;
  }

const ChatOnGame: React.FunctionComponent<ChatOnProps> = ({ socket }) => {
	const [messages, setMessages] = useState<any[]>([]);

	useEffect(() => {
	  socket.on('messageResponse', (data: any) => setMessages([...messages, data]));
	}, [socket, messages]);
  
	return (
		<div className="chatWindowContainer">
			<ChatonGameBody messages={messages} />
			<ChatonGameFooter socket={socket} />
		</div> 
	);
}

export default ChatOnGame;