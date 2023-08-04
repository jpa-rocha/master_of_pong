import React, { useEffect, useState } from 'react';
import './PopUp.css'
import { Socket } from 'socket.io-client';

interface User {
	forty_two_id: number;
	username: string | undefined;
	refresh_token: string;
	email: string;
	avatar: string;
	is_2fa_enabled: boolean;
	xp: number;
	id: string;
}

interface ChatProp {
	id: number;
	title: string;
	channel: string;
	users: User[];
	admins: User[];
	banned: User[];
	muted: User[];
	creator: User;
}

type BannedUsersPopUpProps = {
  isOpen: boolean;
  onClose: () => void;
  socket: Socket;
  chat: ChatProp;
};

const BannedUsersPopUp: React.FC<BannedUsersPopUpProps> = ({ isOpen, onClose, socket, chat }) => {
	const handleUnBan = (targetID: string) => {
		socket.emit("unbanUser", {userID: targetID, chatID: chat.id});
	}

	const handleUnMute = (targetID: string) => {
		socket.emit("unmuteUser", {userID: targetID, chatID: chat.id});
	}

	console.log("CHAT = ", chat);

  return (
    <>
    	<div>

			<h3 className="PopHeader">
				Banned Users
			</h3>

			<div className="PopBody">
				{chat.banned && chat.banned.map((user) => (
					<div key={user.id}>
						{user.username}
						<button onClick={() => handleUnBan(user.id)} className="relative ml-3 text-sm bg-indigo-100 py-2 px-4 shadow rounded-xl">
							unban
						</button>
					</div>
				))}
         	</div>

			<h3 className="PopHeader">
				Muted Users
			</h3>

			<div className="PopBody">
				{chat.muted && chat.muted.map((user) => (
					<div key={user.id}>
						{user.username}
						<button onClick={() => handleUnMute(user.id)} className="relative ml-3 text-sm bg-indigo-100 py-2 px-4 shadow rounded-xl">
							unmute
						</button>
					</div>
				))}
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

export default BannedUsersPopUp;