import React, {useEffect, useState} from "react";
import './PopUp.css'
import { Socket } from "socket.io-client";

type PopUpCreateChatProps = {
	isOpen: boolean;
	onClose: () => void;
	onCreateChatRoom: (chatRoomName: string, chatRoomPassword: string) => void;
	socket: Socket;
};

const PopUpCreateChat: React.FC<PopUpCreateChatProps> = ({ isOpen, onClose, onCreateChatRoom, socket }) => {
	const [chatRoomName, setChatRoomName] = useState('');
	const [chatRoomPassword, setChatRoomPassword] = useState('');
	const [nameError, setNameError] = useState<string>('');

	const handleCreateChatRoom = async () => {
		if (chatRoomName === '' || nameError)
			return;
		onCreateChatRoom(chatRoomName, chatRoomPassword);
		onClose();
	};
	
	useEffect(() => {
		const checkChatTitle = (name: string) => {
			return new Promise((resolve, reject) => {
				socket.emit('checkChatRoomName', {name}, (result: boolean) => {
					console.log('Response from server:', result);
					resolve(result);
				});
			});
		};

		const getAvailability = async () => {
			const availability = await checkChatTitle(chatRoomName);
			console.log("AVAILABILITY = ", availability);
			if (!availability)
				setNameError("This chat room name is already taken");
			else if (chatRoomName.length > 20)
				setNameError("Name must be 20 characters or shorter");
			else 
				setNameError("");
		}
		getAvailability();
	}, [chatRoomName, socket]);

	if (!isOpen) return null;

	return (
		<>
		<div>
			<h3 className="PopHeader">
				Create a chat room
			</h3>
			<div className="PopBody">

				{/* Input Part */}
				<div className="name-input">
					<input type="text" placeholder="Chat Room Name" value={chatRoomName} onChange={(e) => setChatRoomName(e.target.value)} />
					<div className="error">{nameError}</div>
				</div>
				<div className="password-input">
					<input type="text" placeholder="Password" value={chatRoomPassword} onChange={(e) => setChatRoomPassword(e.target.value)} />
				</div>

				{/* Button Part : Create, Cancel */}
				<div className="button-container">
					<button className="create-button" onClick={handleCreateChatRoom}>
						Create
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

export default PopUpCreateChat;