/* 
    1. Display all the users in the database
    2. Allow the user to search for a specific user 
        - while typing, display all the users that match the search
    3. Allow the user to add a friend
		- display if a user is already a friend

*/
import { Grid } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import NavBarMainPage from "../Navigation/NavBarMainPage";
import Footer from "../Footer";
import { Socket } from "socket.io-client";
import { getUserID, getToken } from "../../utils/Utils";
//import UserTable from './UserTable'

interface UserProps {
  username: string;
  id: string;
  isFriend: boolean;
  status: string;
}

interface RequestProp {
	id: number;
	sender: UserProps;
}

interface FriendsPageProps {
  socket: Socket;
}

axios.defaults.baseURL = "http://localhost:5000/";

const FriendsPage: React.FunctionComponent<FriendsPageProps> = ({ socket }) => {
  const [users, setUsers] = useState<UserProps[]>([]);
  const [input, setInput] = useState<string>("");
  const [render, setRender] = useState<boolean>(false);
  const [userID, setUserID] = useState<string>("");
  const [requests, setRequests] = useState<RequestProp[]>([]);
  const token = getToken("jwtToken");

  (async () => {
    setUserID(await getUserID(getToken("jwtToken")));
  })();

  if (userID !== "") {
    socket.emit("activityStatus", { userID: userID, status: "online" });
  }
  useEffect(() => {
    console.log("USERID = ", userID);
    async function getUsers(input: string) {
      const id = await axios
        .post("api/auth/getUserID", { token })
        .then((res) => res.data);
      if (input === "")
        setUsers(
          await axios.get(`api/users/friends/${id}`).then((res) => res.data)
        );
      else
        setUsers(
          await axios
            .get(`api/users/friends/name/${id}/${input}`)
            .then((res) => res.data)
        );
		setRequests(
		  await axios
		  	.get(`api/users/requests/${id}`)
			.then((res) => res.data)
		)
    }
    getUsers(input);
    setRender(false);
  }, [input, token, render, userID]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const handleSendFriendRequest = async (friendID: string) => {
    const userID = await axios
      .post("api/auth/getUserID", { token })
      .then((res) => res.data);
    await axios.post(`api/users/addFriend/${userID}/${friendID}`);
    setRender(true);
  };

  const handleAccept = async (friendID: string) => {
	const userID = await axios
		.post("api/auth/getUserID", { token })
		.then((res) => res.data);
  	await axios.post(`api/users/acceptFriend/${userID}/${friendID}`);
  	setRender(true);
  }

  const handleReject = async (friendID: string) => {
	const userID = await axios
		.post("api/auth/getUserID", { token })
		.then((res) => res.data);
  	await axios.post(`api/users/rejectFriend/${userID}/${friendID}`);
  	setRender(true);
  }

  const removeFriend = async (friendID: string) => {
	const userID = await axios
		.post("api/auth/getUserID", { token })
		.then((res) => res.data);
  	await axios.post(`api/users/removeFriend/${userID}/${friendID}`);
  	setRender(true);
  }

  return (
    <>
    <Grid container direction="column">
        <Grid item xs={2}>
        	<NavBarMainPage></NavBarMainPage>
        </Grid>

		<Grid item xs={10} mt={9}>
			<div className="relative overflow-x-auto shadow-md sm:rounded-lg md:px-10">
    			<div className="flex items-center justify-end pb-4 bg-white">
				{/* For the search bar */}
        			<div className="relative">
        				<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        			    	<svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" 
								fill="none"
        			    		viewBox="0 0 20 20">
        			    		<path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        			        			d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
        			    	</svg>
        			</div>
        			<input type="text" placeholder="Search for users"
            			className="block p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 
									focus:ring-blue-500 focus:border-blue-500"
						onChange={handleSearchChange}/>
        		</div>
    			</div>
				<div>
					<thead className="w-full text-xs text-gray-700 uppercase bg-gray-200">
						<tr>
							<th scope="col" className="px-2 py-3 "></th>
							<th scope="col" className="px-20 py-3">User</th>
							<th scope="col" className="pl-30 py-3 w-full">Status</th>
							<th scope="col" className="px-20 py-3">Add</th>
							<th scope="col" className="pr-30 py-3"></th>
						</tr>
					</thead>
				</div>
				{users && users.map( (item, index) => (
					<table key={index} className="w-full text-sm text-left text-gray-500 pb-4">
						<tbody>
							<tr className="bg-white border-b hover:bg-gray-50">
								<th scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap">
									<img className="w-10 h-10 rounded-full" src="" alt="user"/>
									<div className="pl-3">
										<div className="text-base font-semibold">{item.username}</div>
										<div className="font-normal text-gray-500"></div>
									</div>  
								</th>
								<td className="px-6 py-4">
									<div className="flex items-center">
										<div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>
										{item.status}
									</div>
								</td>
								<td className="px-6 py-4">
									{ !item.isFriend ? (
										<button className="font-medium text-blue-600 hover:underline" onClick={() => handleSendFriendRequest(item.id)}>
											Add as Friend
										</button>
									) : (
										<button className="font-medium text-blue-600 hover:underline" onClick={() => removeFriend(item.id)}>
											Remove Friend
										</button>
									)}
								</td>
							</tr>
						</tbody>
					</table>
				))}
    		</div>
		</Grid>

        <Grid item xs={12}>
          <Footer></Footer>
        </Grid>
      </Grid>
	  <div className="flex flex-col justify-center items-center bg-gray-100 p-3 mt-2">
	  <div className="px-3 my-6"><span className="text-black text-xl font-bold">Friend Requests : </span></div>
	  {requests && requests.map((item, index) => (
		<div className="flex justify-start px-3" key={index}>
			<span className="ml-2">{item.sender.username}</span>
			<button className="mx-3 font-medium text-blue-600 hover:underline" onClick={() => handleAccept(item.sender.id)}>
				Accept Friend
			</button>
			<button className="mx-3 font-medium text-blue-600 hover:underline" onClick={() => handleReject(item.sender.id)}>
				Reject Friend
			</button>
		</div>
	  ))}
	  </div>
    </>
  );
};
export default FriendsPage;
