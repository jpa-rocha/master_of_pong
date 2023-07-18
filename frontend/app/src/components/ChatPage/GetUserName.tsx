import React from 'react'
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Socket } from 'socket.io-client';
import "./chatPageStyle/chat.css";

interface GetUserNameProps {
	socket: Socket;
}

const GetUserName: React.FunctionComponent<GetUserNameProps> = ( { socket} ) => {

	const [userName, setUserName] = useState('');
	const navigate = useNavigate();

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {

		e.preventDefault();
		localStorage.setItem('userName', userName);
		console.log("username:", userName);
		//sends the username and socket ID to the Node.js server
		socket.emit('newUser', { userName, socketID: socket.id });
		navigate('/chatPage');
	  };


  return (
	<div className='container'>
		<h2>Sign in to Open the Chat</h2>
		<form onSubmit={handleSubmit}>
			{/* <label htmlFor="username">Username</label> */}
			<input type="text"
			  name="username"
			  id="username"
			  className="usernameInput"
			  placeholder='username'
			  value={userName}
			  onChange={(e) => setUserName(e.target.value)}
			/>
			<button className="button">SIGN IN</button>
  		</form>
  	</div>
  )

}

export default GetUserName;

