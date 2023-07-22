/* 
    1. Display all the users in the database
    2. Allow the user to search for a specific user 
        - while typing, display all the users that match the search
    3. Allow the user to add a friend
		- display if a user is already a friend

*/
import { Box, Grid } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import "./FriendsStyle.css";
import { getToken } from "../../utils/Utils";
import NavBarMainPage from "../NavBarMainPage";
import Footer from "../Footer";

interface UserProps {
    username: string;
    id: string;
	isFriend: boolean;
}

axios.defaults.baseURL = "http://localhost:5000/"

const FriendsPage: React.FC = () => {
    const [users, setUsers] = useState<UserProps[]>([]);
	const [input, setInput] = useState<string>("");
	const [render, setRender] = useState<boolean>(false);
	const token = getToken('jwtToken');
	
	useEffect(() => {
		async function getUsers( input: string) {
			const id = await axios.post("api/auth/getUserID", { token }).then((res) => res.data);
			if (input === "")
				setUsers(await axios.get(`api/users/friends/${id}`).then((res) => res.data));
			else 
				setUsers(await axios.get(`api/users/friends/name/${id}/${input}`).then((res) => res.data));
		}
		getUsers(input);
		setRender(false);
	}, [input, token, render])
	
	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setInput(event.target.value);
	}
    
	const handleSendFriendRequest = async (friendID: string)=> {
		const userID = await axios.post("api/auth/getUserID", { token }).then((res) => res.data);
		await axios.post(`api/users/addFriend/${userID}/${friendID}`);
		setRender(true);
	}
	
	return (
		<>
		<Grid container direction="column">
			<Grid item xs={2}>
				<NavBarMainPage></NavBarMainPage>
			</Grid>

			<Grid item xs={10} mt={9}>
				<Box className="Search">
					<input value={input} type="text" placeholder="Search for a user" onChange={handleSearchChange} />
				</Box>
				<ul>
					{users && users.map((item, index) => (
					<Box className="User" key={index} display="flex" alignItems="center">
						<li>
						{item.username}
						</li>
						<Box flex="1" />
						{!item.isFriend ? (
						<button onClick={() => handleSendFriendRequest(item.id)}>
							Add Friend
						</button>
						) : (
						<span>Already a friend</span>
						)}
					</Box>
					))}
				</ul>
			</Grid>

			<Grid item xs={12}>
				<Footer></Footer>
			</Grid>
      	</Grid>
		</>
	);
};
export default FriendsPage;