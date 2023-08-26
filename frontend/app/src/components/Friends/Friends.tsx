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

const imgStyle = {
  background:
    "linear-gradient(to right, #EA4224 0%, #c49b2b 50%, #EA4224 100%)",
};

axios.defaults.baseURL = process.env.REACT_APP_BACKEND;

const FriendsPage: React.FunctionComponent<FriendsPageProps> = ({ socket }) => {
  const [users, setUsers] = useState<UserProps[]>([]);
  const [input, setInput] = useState<string>("");
  const [render, setRender] = useState<boolean>(false);
  const [userID, setUserID] = useState<string>("");
  const [requests, setRequests] = useState<RequestProp[]>([]);
  const token = getToken(process.env.REACT_APP_JWT_NAME as string);

  (async () => {
    setUserID(
      await getUserID(getToken(process.env.REACT_APP_JWT_NAME as string))
    );
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
        await axios.get(`api/users/requests/${id}`).then((res) => res.data)
      );
    }
    getUsers(input);
    setRender(false);
  }, [input, token, render, userID]);

  useEffect(() => {
    function handleRerender() {
      setRender(!render);
    }
    socket.on("updateFriendsPage", handleRerender);
    return () => {
      socket.off("updateFriendsPage", handleRerender);
    };
  }, [socket, render]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const handleSendFriendRequest = async (friendID: string) => {
    const userID = await axios
      .post("api/auth/getUserID", { token })
      .then((res) => res.data);
    await axios.post(`api/users/addFriend/${userID}/${friendID}`);
    socket.emit("informFriendsPage", { targetID: friendID });
    setRender(true);
  };

  const handleAccept = async (friendID: string) => {
    const userID = await axios
      .post("api/auth/getUserID", { token })
      .then((res) => res.data);
    await axios.post(`api/users/acceptFriend/${userID}/${friendID}`);
    socket.emit("informFriendsPage", { targetID: friendID });
    setRender(true);
  };

  const handleReject = async (friendID: string) => {
    const userID = await axios
      .post("api/auth/getUserID", { token })
      .then((res) => res.data);
    await axios.post(`api/users/rejectFriend/${userID}/${friendID}`);
    socket.emit("informFriendsPage", { targetID: friendID });
    setRender(true);
  };

  const removeFriend = async (friendID: string) => {
    const userID = await axios
      .post("api/auth/getUserID", { token })
      .then((res) => res.data);
    await axios.post(`api/users/removeFriend/${userID}/${friendID}`);
    socket.emit("informFriendsPage", { targetID: friendID });
    setRender(true);
  };

  return (
    <>
      <Grid container>
        <Grid item xs={12}>
          <NavBarMainPage socket={socket}></NavBarMainPage>
        </Grid>

        <Grid item xs={12} style={imgStyle} className="h-[100vh] w-full">
          <div className="flex flex-col justify-center items-center">
            <div className="md:text-lg max-w-lg md:w-[80%] md:max-w-[80%] relative overflow-x-auto p-2 mt-10">
              <div className="flex items-center justify-end p-4  w-[100%] bg-yellow-50">
                {/* For the search bar */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 20"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search for users"
                    className="block p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50"
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
              <div>
                <table className="md:text-lg max-w-lg w-[80%] md:w-[100%] md:max-w-[100%] text-sm text-left text-gray-500 bg-yellow-50">
                  <thead className="w-full text-sm md:text-md text-gray-700 uppercase border-b-2 border-b-yellow-100">
                    <tr>
                      <th scope="col" className="px-20 py-3">
                        User
                      </th>
                      <th scope="col" className="px-20 py-3">
                        Status
                      </th>
                      <th scope="col" className="px-20 py-3">
                        Add
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-yellow-50">
                    {users &&
                      users.map((item, index) => (
                        <tr
                          key={index}
                          className="border-b border-yellow-100 hover:bg-yellow-100"
                        >
                          <th
                            scope="row"
                            className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap"
                          >
                            <img
                              className="w-10 h-10 rounded-full object-cover mr-3"
                              src={`${process.env.REACT_APP_BACKEND}/api/users/avatars/${item.id}`}
                              alt="user"
                            />
                            <div className="pl-3">
                              <div className="text-base font-semibold">
                                {item.username}
                              </div>
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
                            {!item.isFriend ? (
                              <button
                                className="font-medium text-green-800 hover:text-green-950 hover:underline"
                                onClick={() => handleSendFriendRequest(item.id)}
                              >
                                Add as Friend
                              </button>
                            ) : (
                              <button
                                className="font-medium text-blue-600 hover:underline"
                                onClick={() => removeFriend(item.id)}
                              >
                                Remove Friend
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="md:text-lg max-w-lg md:w-[80%] md:max-w-[80%] flex flex-col justify-center items-center bg-yellow-50 p-3 m-2">
              <div className="px-3 my-6">
                <span className="text-black text-xl font-bold">
                  Friend Requests :{" "}
                </span>
              </div>
              {requests &&
                requests.map((item, index) => (
                  <div className="flex justify-start px-3" key={index}>
                    <span className="ml-2">{item.sender.username}</span>
                    <button
                      className="mx-3 font-medium text-blue-600 hover:underline"
                      onClick={() => handleAccept(item.sender.id)}
                    >
                      Accept Friend
                    </button>
                    <button
                      className="mx-3 font-medium text-blue-600 hover:underline"
                      onClick={() => handleReject(item.sender.id)}
                    >
                      Reject Friend
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </Grid>

        <Grid item xs={12}>
          <Footer></Footer>
        </Grid>
      </Grid>
    </>
  );
};
export default FriendsPage;
