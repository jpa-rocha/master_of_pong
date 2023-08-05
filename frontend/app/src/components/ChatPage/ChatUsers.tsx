import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { getToken } from "../../utils/Utils";
import axios from "axios";
import InteractPopUp from "./PopUpInteract";
import { User, Chat } from "./PropUtils";
import './PopUp.css'

axios.defaults.baseURL = "http://localhost:5000/";

interface ChatUsersProps {
	socket: Socket;
}

const ChatUsers: React.FunctionComponent<ChatUsersProps> = ({ socket }) => {
	const [userCurrent, setUserCurrent] = useState<User>();
	const [userCurrentRole, setUserCurrentRole] = useState<string>("");


	const [chat, setChat] = useState<Chat>();
	const [users, setUsers] = useState<User[]>([]);
	const [admins, setAdmins] = useState<User[]>([]);

	const [userOwner, setUserOwner] = useState<User | undefined>();
	const [userME, setUserME] = useState<User | undefined>();
	const [userRegular, setUserRegular] = useState<User[]>([]);
	const [userAdmin, setUserAdmin] = useState<User[]>([]);


	const [mutedAdmins, setMutedAdmins] = useState<{ id: string; isMuted: boolean }[]>([]);
	const [mutedUsers, setMutedUsers] = useState<{ id: string; isMuted: boolean }[]>([]);
	const [mutedMe, setMutedMe] = useState<boolean>();

	const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);

	const [interactTarget, setInteractTarget] = useState<User>();
	const [interactTargetRole, setInteractTargetRole] = useState<string>("");

	useEffect(() => {
		const fetchMutedStatus = async () => {
			const checkIfMuted = (targetID: string): Promise<boolean> => {
				return new Promise((resolve, reject) => {
				  socket.emit('checkMuted', { targetID: targetID, chatID: chat?.id });
			  
				  socket.on('isMutedReturn', (response) => {
					socket.off('isMutedReturn'); // Remove the event listener
					resolve(response);
				  });
				});
			  };

			async function checkMute(targetID: string) {
				try {
					const isMuted = await checkIfMuted(targetID);
					return isMuted;
				} catch (error) {
					console.error('Error:', error);
				}
			}

		  const mutedAdminsStatus = await Promise.all(
			userAdmin.map(async (user) => ({
			  id: user.id,
			  isMuted: await checkMute(user.id),
			}))
		  );

		  const mutedRegularStatus = await Promise.all(
			userRegular.map(async (user) => ({
			  id: user.id,
			  isMuted: await checkMute(user.id),
			}))
		  );

		  const transformedMutedAdminStatus = mutedAdminsStatus.map((status) => ({
			id: status.id,
			isMuted: status.isMuted || false, // Set to false if it's undefined
		  }));
		  const transformedMutedRegularStatus = mutedRegularStatus.map((status) => ({
			id: status.id,
			isMuted: status.isMuted || false, // Set to false if it's undefined
		  }));

		  setMutedAdmins(transformedMutedAdminStatus);
		  setMutedUsers(transformedMutedRegularStatus);
		  if (userME)
		  	setMutedMe(await checkMute(userME.id));
		};
	
		fetchMutedStatus();
	  }, [userAdmin, userRegular, userME, chat, socket]);

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
		if (chat && userCurrent) {
			if (chat.channel === "direct") {
				setUserME(userCurrent);
				const otherUser = users.filter((user) => user.id !== userCurrent.id);
				setUserRegular(otherUser);
				setUserOwner(undefined);
				setUserAdmin([]);
				setUserCurrentRole("Regular");
			} else {
				const owner = chat.creator;
				setUserOwner(owner);
				if (owner.id !== userCurrent.id) {
					setUserME(userCurrent);
					setUserCurrentRole("Regular");
				} else {
					setUserME(undefined);
					setUserCurrentRole("Owner");
				}
				const checkADMIN = admins.filter((user) => user.id === userCurrent.id);
				if (checkADMIN && userCurrent.id !== userOwner?.id)
					setUserCurrentRole("Admin");
				const chatPolice = admins.filter((user) => user.id !== userCurrent.id && user.id !== userOwner?.id);
				const chatPoliceID = chatPolice.map((admin) => admin.id);
				setUserAdmin(chatPolice);
				const regulars = users.filter((user) => user.id !== userCurrent.id && user.id !== userOwner?.id && !chatPoliceID.includes(user.id));
				setUserRegular(regulars);
			}
		}

		const handleReturnChat = (chat: Chat) => {
			if (chat && chat.id) {
				setChat(chat);
				setUsers(chat.users);
				setAdmins(chat.admins);
			}
		}

		const handleStatusRender = () => {
			socket.emit('getChatRoom', {chatID: chat?.id})
		};

		socket.on("returnChatUsers", handleReturnChat);
		socket.on("user connected users", handleStatusRender);
    	socket.on("user disconnected users", handleStatusRender);
		return () => {
			socket.off("returnChatUsers", handleReturnChat);
			socket.off("user connected users", handleStatusRender);
    		socket.off("user disconnected users", handleStatusRender);
		};
	}, [socket, chat, users, admins, userOwner?.id, userCurrent]);

	const togglePopup = () => {
		setInteractTarget(undefined);
		setInteractTargetRole("");
		setIsPopupOpen(!isPopupOpen);
	};

	const interactWithUser = (target: User, targetRole: string) => {
		setInteractTarget(target);
		setInteractTargetRole(targetRole);
		setIsPopupOpen(!isPopupOpen);
	}

	return (
		<>
		<div className="flex flex-col py-8 pl-6 pr-2 rounded-2xl w-64 bg-gray-200 flex-shrink-0">
			<div className="ml-2 font-bold text-2xl">Users</div>
			{userME ? (
				<div className="user-container">
					{userME.username} {userME.status === "online" ? <>🟢</> : <>🔴</>}
					{mutedMe ? <div>&nbsp;🔇</div>: null}
				</div>
			): null}

			{userOwner ? (
				<div>
					{userOwner.username} {userOwner.status === "online" ? <>🟢</> : <>🔴</>} 👑
					{userME ? (
						<button className="relative ml-3 text-sm bg-white shadow rounded-xl" onClick={() => interactWithUser(userOwner, "Owner")} >interact</button>
					):null}
				</div>
			): null}

			{userAdmin && userAdmin.map((user, index) => (
				<div key={user.id} className="user-container">
					<div>
						{user.username} {user.status === "online" ? <span>🟢</span> : <span>🔴</span>} 👮
					</div>
					{mutedAdmins[index]?.isMuted ? <div>&nbsp;🔇</div> : null}
					<button className="relative ml-3 text-sm bg-white shadow rounded-xl" onClick={() => interactWithUser(user, "Admin")}>interact</button>
				</div>
			))}

			{userRegular && userRegular.map((user, index) => (
				<div key={user.id}  className="user-container">
					{user.username} {user.status === "online" ? <>🟢</> : <>🔴</>}
					{mutedUsers[index]?.isMuted ? <div>&nbsp;🔇</div> : null}
					<button className="relative ml-3 text-sm bg-white shadow rounded-xl" onClick={() => interactWithUser(user, "Regular")} >interact</button>
				</div>
			))}
		</div>

		{isPopupOpen && userCurrent && chat && interactTarget && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999,
          }}
        >
          <InteractPopUp isOpen={isPopupOpen} onClose={togglePopup} socket={socket} chat={chat} user={userCurrent} userRole={userCurrentRole} target={interactTarget} targetRole={interactTargetRole}/>
        </div>
      	)}
		</>
	);
}

export default ChatUsers;