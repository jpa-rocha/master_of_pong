import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import "../../styles/chat.css";

interface User {
  socketID: string;
  userName: string;
}

interface ChatBarProps {
  socket: Socket;
}

const ChatBar: React.FunctionComponent<ChatBarProps> = ({ socket }) => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    socket.on('newUserResponse', (data: User[]) => setUsers(data));
  }, [socket]);

  return (
	<div className="chatSidebar">
		<h2>Chat Bar</h2>
    	<div className='activeUsers'>
    	    <h4 className="chatHeader">Online</h4>
    	    <div className="onlineUsers">
    	      {users.map((user) => (
    	        <p key={user.socketID}>{user.userName}</p>))}
    	    </div>
    	</div>
		<div className='allUsers'>
			<h4 className="chatHeader">Friends</h4>
        	<div className="chatUsers">
				{/* instead of socketID, need friendsID */}
				{users.map((user) => (
    	        <p key={user.socketID}>{user.userName}</p>))} 
       		</div>
	  	</div>
    </div>
  );
};

export default ChatBar;
