import React, { useEffect, useState } from 'react';
import './PopUp.css'
import { Socket } from 'socket.io-client';

interface User {
	socketID: string;
	username: string;
	isFriend: boolean;
	status: string;
	id: string;
}

interface ChatProp {
	id: number;
	title: string;
	channel: string;
	users: User[];
	admins: User[];
	creator: User;
}

type InteractPopUpProps = {
  isOpen: boolean;
  onClose: () => void;
  socket: Socket;

  chat: ChatProp;

  user: User; 
  userRole: string;

  target: User;
  targetRole: string;
};


// What needs to be sent :
// Chat
// My role
// My userProp
// Users role
// Users userProp

// for owner only :
// promote / demote

// for admins only :
// mute
// kick
// ban

// for all users :
// profile
// invite to a game
// block
// personal message

const InteractPopUp: React.FC<InteractPopUpProps> = ({ isOpen, onClose, socket, chat, user, userRole, target, targetRole }) => {
	console.log("Target Role => ", targetRole);
	console.log("User Role   => ", userRole);
	if (!isOpen) return null;

	function handleMakeAdmin() {
		targetRole = "Admin";
		socket.emit('addAdmin', {userID: target.id, chatID: chat?.id});
	}
	
	function handleRemoveAdmin() {
		targetRole = "Regular";
		socket.emit('removeAdmin', {userID: target.id, chatID: chat?.id});
	}

  return (
    <>
    	<div>

			<h3 className="PopHeader">
				{target.username}
			</h3>


			<div className="PopBody">
				{/* IF USER IS THE OWNER */}
				{userRole === "Owner" && targetRole === "Admin" ? (
					<button className="relative ml-3 text-sm bg-white shadow rounded-xl" onClick={() => handleRemoveAdmin()} >Demote</button>
				): null}

				{userRole === "Owner" && targetRole === "Regular" ? (
					<button className="relative ml-3 text-sm bg-white shadow rounded-xl" onClick={() => handleMakeAdmin()} >Promote</button>
				): null}

				{/* IF USER IS THE OWNER OR AN ADMIN */}
				{userRole === "Owner" ? (
					<div>
						<button className="relative ml-3 text-sm bg-white shadow rounded-xl">Mute</button>
						<button className="relative ml-3 text-sm bg-white shadow rounded-xl">Kick</button>
						<button className="relative ml-3 text-sm bg-white shadow rounded-xl">Ban</button>
					</div>
				): null}
				
				{userRole === "Owner" && targetRole !== "Owner" && targetRole !== "Admin" ? (
					<div>
						<button className="relative ml-3 text-sm bg-white shadow rounded-xl">Mute</button>
						<button className="relative ml-3 text-sm bg-white shadow rounded-xl">Kick</button>
						<button className="relative ml-3 text-sm bg-white shadow rounded-xl">Ban</button>
					</div>
				): null}

				{/* FOR ALL USERS */}
				<div>
					<button className="relative ml-3 text-sm bg-white shadow rounded-xl">Profile</button>
					<button className="relative ml-3 text-sm bg-white shadow rounded-xl">Block</button>
					<button className="relative ml-3 text-sm bg-white shadow rounded-xl">DM</button>
					<button className="relative ml-3 text-sm bg-white shadow rounded-xl">Challenge</button>
				</div>

         	</div>


			<div className="button-container">
				<button className="cancel-button" onClick={onClose}>
				Cancel
				</button>
			</div>
    	</div>
    </>
  );
};

export default InteractPopUp;