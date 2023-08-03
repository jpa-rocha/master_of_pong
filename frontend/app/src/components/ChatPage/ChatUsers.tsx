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
	admins: User[];
	creator: User;
}

const ChatUsers: React.FunctionComponent<ChatUsersProps> = ({ socket }) => {
	const [userCurrent, setUserCurrent] = useState<User>();

	const [chat, setChat] = useState<ChatProp>();
	const [users, setUsers] = useState<User[]>([]);
	const [admins, setAdmins] = useState<User[]>([]);

	const [userOwner, setUserOwner] = useState<User | undefined>();
	const [userME, setUserME] = useState<User | undefined>();
	const [userRegular, setUserRegular] = useState<User[]>([]);
	const [userAdmin, setUserAdmin] = useState<User[]>([]);

	useEffect(() => {
		const getUserGET = async () => {
			const token = getToken("jwtToken");
			const id = await axios.post("api/auth/getUserID", { token }).then((res) => res.data);
			const user = await axios.get(`api/users/${id}`);
			return user.data;
		}
		const getUserSET = async () => { 
			const tempUser = await getUserGET();
			if (tempUser)
				setUserCurrent(tempUser);
		}
		getUserSET();
	}, []);

	useEffect(() => {
		if (chat?.channel === "direct") {
			setUserME(userCurrent);
			const otherUser = users.filter((user) => user.id !== userCurrent?.id);
			setUserRegular(otherUser);
			setUserOwner(undefined);
			setUserAdmin([]);
		} else {
			const owner = chat?.creator;
			setUserOwner(owner);
			if (owner?.id !== userCurrent?.id) {
				setUserME(userCurrent);
			} else {
				setUserME(undefined);
			}
			const chatPolice = admins.filter((user) => user.id !== userCurrent?.id && user.id !== userOwner?.id);
			const chatPoliceID = chatPolice.map((admin) => admin.id);
			setUserAdmin(chatPolice);
			const regulars = users.filter((user) => user.id !== userCurrent?.id && user.id !== userOwner?.id && !chatPoliceID.includes(user.id));
			setUserRegular(regulars);
		}
		const regulars = users.filter((user) => user.id !== userCurrent?.id && user.id !== userOwner?.id);
		setUserRegular(regulars);

		const handleReturnChat = (chat: ChatProp) => {
			if (chat.id) {
				setChat(chat);
				setUsers(chat.users);
				setAdmins(chat.admins);
			  }
		}
		socket.on("returnChatUsers", handleReturnChat);
		return () => {
			socket.off("returnChatUsers", handleReturnChat);
		};
	}, [socket, chat, users, admins, userOwner?.id, userCurrent]);

	return (
		<>
		<div className="flex flex-col py-8 pl-6 pr-2 mt-3 rounded-2xl w-64 bg-gray-100 flex-shrink-0">
			<div className="ml-2 font-bold text-2xl">Users</div>

			{userME ? (
				<div>
					{userME.username} {userME.status === "online" ? <>🟢</> : <>🔴</>}
				</div>
			): null}

			{userOwner ? (
				<div>
					{userOwner.username} {userOwner.status === "online" ? <>🟢</> : <>🔴</>} 👑
				</div>
			): null}

			{userAdmin && userAdmin.map((user) => (
				<div key={user.id}>
					{user.username} {user.status === "online" ? <>🟢</> : <>🔴</>} 👮
				</div>
			))}

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