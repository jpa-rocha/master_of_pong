import React, {useEffect, useState} from "react";
import './PopUp.css'
import { Socket } from "socket.io-client";

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
	creator: User;
}

type PopUpPasswordProps = {
	isOpen: boolean;
	onClose: () => void;
	socket: Socket;
	chat: ChatProp;
	user: User;
};

const PopUpPassword: React.FC<PopUpPasswordProps> = ({ isOpen, onClose, socket, chat, user }) => {
	const [oldPassword, setOldPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [nameError, setNameError] = useState<string>('');

	if (!isOpen) return null;

	return (
		<>
		<div>
			<h3 className="PopHeader">
				Manage Password
			</h3>
			<div className="PopBody">

				{/* Input Part */}
				<div className="name-input">
					<input type="password" placeholder="Old Password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
				</div>
				<div className="password-input">
					<input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
				</div>
				<div>
					* private chat room - put in a Password
				</div>
				<div>
					* public chat room - leave Password blank
				</div>

				{/* Button Part : Create, Cancel */}
				<div className="button-container">
					<button className="create-button">
						Change Password
					</button>
					<button className="cancel-button" onClick={onClose}>
						Cancel
					</button>
				</div>
			</div>
		</div>
		</>
	);
}

export default PopUpPassword;