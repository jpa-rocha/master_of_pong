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

const InteractPopUp: React.FC<InteractPopUpProps> = ({ isOpen, onClose, socket, chat, user, userRole, target, targetRole }) => {
	const [targetState, setTargetState] = useState(targetRole);

	if (!isOpen) return null;

	function handleMakeAdmin() {
		setTargetState("Admin");
		socket.emit('addAdmin', {userID: target.id, chatID: chat?.id});
	}
	
	function handleRemoveAdmin() {
		setTargetState("Regular");
		socket.emit('removeAdmin', {userID: target.id, chatID: chat?.id});
	}

	function handleKick() {
		socket.emit("kickUser", {userID: target.id, chatID: chat.id});
	}

  return (
    <>
    	<div>

			<h3 className="PopHeader">
				{target.username}
			</h3>

			<div className="PopBody">
				{/* IF USER IS THE OWNER */}
				<div className='interact-container'>
					<div className='owner-buttons'>						
						{userRole === "Owner" && targetState === "Admin" ? (
							<button className='red-back' onClick={() => handleRemoveAdmin()}>Demote</button>
						): null}

						{userRole === "Owner" && targetState === "Regular" ? (
							<button className='green-back' onClick={() => handleMakeAdmin()}>Promote</button>
						): null}
					</div>
				</div>

				{/* IF USER IS THE OWNER OR AN ADMIN */}
				<div className='interact-container'>
					{userRole === "Owner" ? (
						<div className="admin-buttons">
							<button className='red-back'>Mute</button>
							<button className='red-back' onClick={() => handleKick()}>Kick</button>
							<button className='red-back'>Ban</button>
						</div>
					): null}
					
					{userRole === "Admin" && targetState !== "Owner" && targetState !== "Admin" ? (
						<div className="admin-buttons">
							<button className='red-back'>Mute</button>
							<button className='red-back' onClick={() => handleKick()}>Kick</button>
							<button className='red-back'>Ban</button>
						</div>
					): null}
				</div>

				{/* FOR ALL USERS */}
				<div className='interact-container'>
					<div className="regular-buttons">
						<button className='blue-back'>Profile</button>
						<button className='blue-back'>DM</button>
						<button className='blue-back'>Challenge</button>
						<button className='red-back'>Block</button>
					</div>
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