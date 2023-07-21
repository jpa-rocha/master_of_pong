
/* 
    1. Display all the users in the database
    2. Allow the user to search for a specific user 
        - while typing, display all the users that match the search
    3. Allow the user to add a friend
		- display if a user is already a friend

*/
import { Box } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import "./FriendsStyle.css";
import { getToken } from "../../utils/Utils";

interface UserProps {
    username: string;
    id: string;
	isFriend: boolean;
}

axios.defaults.baseURL = "http://localhost:5000/"

const FriendsPage: React.FC = () => {
    const [users, setUsers] = useState<UserProps[]>([]);
	const [token, setToken] = useState<string>(getToken('jwtToken'));
	const [input, setInput] = useState<string>("");
	const [ButtonText, setButtonText] = useState<string>("Add Friend");
	
	async function getUsers( input: string) {
		const id = await axios.post("api/auth/getUserID", { token }).then((res) => res.data);
		if (input === "")
			setUsers(await axios.get(`api/users/friends/${id}`).then((res) => res.data));
		else 
			setUsers(await axios.get(`api/users/friends/name/${id}/${input}`).then((res) => res.data));
	}

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setInput(event.target.value);
	}
    
	const handleSendFriendRequest = async (friendID: string)=> {
		const token = getToken("jwtToken");
		const userID = await axios.post("api/auth/getUserID", { token }).then((res) => res.data);
		console.log("UserID = " + userID);
		console.log("FriendID = " + friendID);
		await axios.post(`api/users/addFriend/${userID}/${friendID}`)
		
		// setButtonText("Friend Request Sent");
	}

	useEffect(() => {
        getUsers(input);
	}, [input])

    return (
		<>
			<Box className="Search">
                <input value={input} type="text" placeholder="Search for a user" onChange={handleSearchChange}/>
            </Box>
			<ul>
				{users && users.map((item, index) => (
					<Box className="User">
						<li key={index}>
							{item.username}
							{!item.isFriend && (
								<button onClick={() => handleSendFriendRequest(item.id)}>
									{`${ButtonText}`}
								</button>
							)}
						</li>
					</Box>
				))}
			</ul>
        </>
	)
};
export default FriendsPage;