import React, { useEffect, useState } from 'react';
import './PopUp.css'
import { Socket } from 'socket.io-client';
import { Message, User, Chat } from "./PropUtils";
import ProfilePageChat from './Profile';

type InteractPopUpProps = {
  isOpen: boolean;
  onClose: () => void;
  socket: Socket;

  chat: Chat;

  user: User; 
  userRole: string;

  target: User;
  targetRole: string;
};

const InteractPopUp: React.FC<InteractPopUpProps> = ({ isOpen, onClose, socket, chat, user, userRole, target, targetRole }) => {
	const [targetState, setTargetState] = useState(targetRole);
	const [isMuted, setIsMuted] = useState<boolean>();
	const [isBlocked, setIsBlocked] = useState<boolean>();
	const [profileToggle, setProfileToggle] = useState<boolean>(false);

	useEffect(() => {
		const handleMutedResult = (result: boolean) => {
			setIsMuted(result);
		}

		const handleBlockedResult = (result: boolean) => {
			setIsBlocked(result);
		}

		socket.emit('checkMutedUser', {targetID: target.id, chatID: chat.id});
		socket.emit('checkBlocked', {targetID: target.id});

		socket.on('isMutedUserReturn', handleMutedResult);
		socket.on('isBlockedReturn', handleBlockedResult);
		return () => {
			socket.off('isMutedUserReturn', handleMutedResult);
			socket.off('isBlockedReturn', handleBlockedResult);
		}
	}, [socket, target, chat]);

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
		onClose();
	}
	
	function handleBan() {
		socket.emit("banUser", {userID: target.id, chatID: chat.id});
		onClose();
	}

	function handleMute() {
		socket.emit("muteUser", {userID: target.id, chatID: chat.id});
		setIsMuted(true);
	}
	
	function handleUnMute() {
		socket.emit("unmuteUser", {userID: target.id, chatID: chat.id});
		setIsMuted(false);
	}

	function handleBlock() {
		socket.emit("blockUser", {targetID: target.id, chatID: chat.id});
		setIsBlocked(true);
	}
	
	function handleUnblock() {
		socket.emit("unblockUser", {targetID: target.id, chatID: chat.id});
		setIsBlocked(false);
	}

	function handleProfile() {
		setProfileToggle(!profileToggle);
	}

	function handleGetDirectChat() {
		socket.emit("getDirectChat", { user1ID: user.id, user2ID: target.id });
		onClose();
	}

  return (
    <>
		{profileToggle ? (
			<ProfilePageChat socket={socket} profileID={target.id}/>
		): (
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
							{isMuted ? (
								<button className='green-back' onClick={() => handleUnMute()}>Unmute</button>
								): (
								<button className='red-back' onClick={() => handleMute()}>Mute</button>
							)}
							<button className='red-back' onClick={() => handleKick()}>Kick</button>
							<button className='red-back' onClick={() => handleBan()}>Ban</button>
						</div>
					): null}
					
					{userRole === "Admin" && targetState !== "Owner" && targetState !== "Admin" ? (
						<div className="admin-buttons">
							{isMuted ? (
								<button className='green-back' onClick={() => handleUnMute()}>Unmute</button>
								): (
								<button className='red-back' onClick={() => handleMute()}>Mute</button>
							)}
							<button className='red-back' onClick={() => handleKick()}>Kick</button>
							<button className='red-back' onClick={() => handleBan()}>Ban</button>
						</div>
					): null}
				</div>

				{/* FOR ALL USERS */}
				<div className='interact-container'>
					<div className="regular-buttons">
						<button className='blue-back' onClick={handleProfile}>Profile</button>
						<button className='blue-back' onClick={handleGetDirectChat}>DM</button>
						<button className='blue-back'>Challenge</button>
						{isBlocked ? (
								<button className='green-back' onClick={() => handleUnblock()}>Unblock</button>
								): (
								<button className='red-back' onClick={() => handleBlock()}>Block</button>
						)}
					</div>

				</div>


         	</div>


			<div className="button-container">
				<button className="cancel-button" onClick={onClose}>
				Cancel
				</button>
			</div>
    	</div>
		)}
    </>
  );
};

export default InteractPopUp;