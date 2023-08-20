import React, {useEffect, useState} from "react";
import './PopUp.css'
import { Socket } from "socket.io-client";
import { Message, User, Chat } from "./PropUtils";

type PopUpPasswordProps = {
	isOpen: boolean;
	onClose: () => void;
	socket: Socket;
	chat: Chat;
	user: User;
};

const PopUpPassword: React.FC<PopUpPasswordProps> = ({ isOpen, onClose, socket, chat, user }) => {
	const [oldPassword, setOldPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [passwordError, setPasswordError] = useState<string>('');

	const checkPassword = (id: number, password: string) => {
		return new Promise((resolve, reject) => {
		  socket.emit('checkChatRoomPassword', {id: id, password: password}, (result: boolean) => {
			resolve(result);
		  });
		});
	  };

	const handleChangePassword = async () => {
		if (chat.channel === "private") {
			const check = await checkPassword(chat.id, oldPassword);
			if (!check) {
				setPasswordError("Wrong password, please try again");
				return ;
			}
		}
		socket.emit("changePassword", {password: newPassword, chatID: chat.id});
		onClose();
	}

	if (!isOpen) return null;

	return (
		<>
		<div>
			<h3 className="PopHeader">
				Manage Password
			</h3>
			<div className="PopBody">

				{/* Input Part */}
				{chat.channel === "private" ? (
					<div className="name-input">
						<input type="password" placeholder="Old Password" maxLength={50} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
						<div className="error-message">{passwordError}</div> 
					</div>
				): null}
				<div className="password-input">
					<input type="password" placeholder="New Password" maxLength={50} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
				</div>
				<div>
					* private chat room - put in a Password
				</div>
				<div>
					* public chat room - leave Password blank
				</div>

				{/* Button Part : Create, Cancel */}
				<div className="button-container">
					<button className="create-button password" onClick={handleChangePassword}>
						Change Password
					</button>
					<button className="cancel-button password" onClick={onClose}>
						Cancel
					</button>
				</div>
			</div>
		</div>
		</>
	);
}

export default PopUpPassword;