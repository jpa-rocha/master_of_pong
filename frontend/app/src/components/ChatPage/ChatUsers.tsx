import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { getToken } from "../../utils/Utils";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:5000/";

interface ChatUsersProps {
	socket: Socket;
}

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
	creator: User;
}

const ChatUsers: React.FunctionComponent<ChatUsersProps> = ({ socket }) => {
	const [chat, setChat] = useState<ChatProp>();
	const [users, setUsers] = useState<User[]>([]);
	const [userID, setUserID] = useState<string>();

	const [userOwner, setUserOwner] = useState<User>();
	const [userME, setUserME] = useState<User>();
	const [userRegular, setUserRegular] = useState<User[]>([]);
	// const [userAdmin, setUserAdmin] = useState<User[]>([]);

	socket.on("returnUsers", (chat: ChatProp) => {
		if (chat.id) {
		  setChat(chat);
		  setUsers(chat.users);
		}
	});

	useEffect(() => {
		const getUserID = async () => {
			const token = getToken("jwtToken");
			const id = await axios.post("api/auth/getUserID", { token }).then((res) => res.data);
			setUserID(id);
		}
		if (chat?.channel !== "direct") {
			getUserID();
			setUserOwner(chat?.creator);
			if (userID !== chat?.creator.id)
				setUserME(users.find(user => user.id === userID));
		}
		const regulars = users.filter((user) => user.id !== userID && user.id !== userOwner?.id);
		setUserRegular(regulars);
	}, [socket, chat, users, userID, userOwner?.id]);

	return (
		<>
		<div className="flex flex-col py-8 pl-6 pr-2 mt-3 rounded-2xl w-64 bg-gray-100 flex-shrink-0">
			<div className="ml-2 font-bold text-2xl">Users</div>

			{userOwner ? (
				<div>
					{userOwner.username} {userOwner.status === "online" ? <>🟢</> : <>🔴</>} 👑
				</div>
			): null}

			{userME ? (
				<div>
					{userME.username} {userME.status === "online" ? <>🟢</> : <>🔴</>}
				</div>
			): null}

			{userRegular && userRegular.map((user) => (
				<div key={user.id}>
					{user.username} {user.status === "online" ? <>🟢</> : <>🔴</>}
				</div>
			))}
		</div>
		</>
	);
}

export default ChatUsers;