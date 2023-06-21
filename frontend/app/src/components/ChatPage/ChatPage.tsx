import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import ChatBar from './ChatBar'
import ChatBody from './ChatBody';
import ChatFooter from './ChatFooter';
import "./chatPageStyle/chat.css";

interface ChatPageProps {
  socket: Socket;
}

const ChatPage: React.FunctionComponent<ChatPageProps> = ({ socket }) => {
	
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    socket.on('messageResponse', (data: any) => setMessages([...messages, data]));
  }, [socket, messages]);

  return (
    <div className="chatPageContainer">
		<div className="chatSide">
      		<ChatBar socket={socket} />
	  	</div>
    	<div className="chatMain">
        	<ChatBody messages={messages} />
        	<ChatFooter socket={socket} />
      	</div> 
    </div>
  );
};

export default ChatPage;
