import { Grid } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import NavBarMainPage from "../Navigation/NavBarMainPage";
import Footer from "../Footer";
import { Socket } from "socket.io-client";
import { getUserID, getToken } from "../../utils/Utils";

interface UserProps {
  username: string;
  id: string;
  isFriend: boolean;
  sentFriendRequest: boolean;
  receivedFriendRequest: boolean;
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
  // const URI = process.env.REACT_APP_GATEWAY as string;
  // socket = socketIO(URI, {
  //   extraHeaders: {
  //     [process.env.REACT_APP_JWT_NAME as string]: getToken(
  //       process.env.REACT_APP_JWT_NAME as string
  //     ),
  //   },
  // });
  const [users, setUsers] = useState<UserProps[]>([]);
  const [input, setInput] = useState<string>("");
  const [render, setRender] = useState<boolean>(false);
  const [userID, setUserID] = useState<string>("");
  const [requests, setRequests] = useState<RequestProp[]>([]);
  const token = getToken(process.env.REACT_APP_JWT_NAME as string);

  (async () => {
    try {
      setUserID(
        await getUserID(getToken(process.env.REACT_APP_JWT_NAME as string))
      );
    } catch {
      window.location.href = process.env.REACT_APP_FRONTEND as string;
    }
  })();

  if (userID !== "") {
    socket.emit("activityStatus", { userID: userID, status: "online" });
  }

  useEffect(() => {
    async function getUsers(input: string) {
      try {
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
      } catch {
        window.location.href = process.env.REACT_APP_FRONTEND as string;
      }
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
    try {
      const userID = await axios
        .post("api/auth/getUserID", { token })
        .then((res) => res.data);
      await axios.post(`api/users/addFriend/${userID}/${friendID}`);
      socket.emit("informFriendsPage", { targetID: friendID });
      setRender(true);
    } catch {
      window.location.href = process.env.REACT_APP_FRONTEND as string;
    }
  };

  const handleAccept = async (friendID: string) => {
    try {
      const userID = await axios
        .post("api/auth/getUserID", { token })
        .then((res) => res.data);
      await axios.post(`api/users/acceptFriend/${userID}/${friendID}`);
      socket.emit("informFriendsPage", { targetID: friendID });
      setRender(true);
    } catch {
      window.location.href = process.env.REACT_APP_FRONTEND as string;
    }
  };

  const handleReject = async (friendID: string) => {
    try {
      const userID = await axios
        .post("api/auth/getUserID", { token })
        .then((res) => res.data);
      await axios.post(`api/users/rejectFriend/${userID}/${friendID}`);
      socket.emit("informFriendsPage", { targetID: friendID });
      setRender(true);
    } catch {
      window.location.href = process.env.REACT_APP_FRONTEND as string;
    }
  };

  const removeFriend = async (friendID: string) => {
    try {
      const userID = await axios
        .post("api/auth/getUserID", { token })
        .then((res) => res.data);
      await axios.post(`api/users/removeFriend/${userID}/${friendID}`);
      socket.emit("informFriendsPage", { targetID: friendID });
      setRender(true);
    } catch {
      window.location.href = process.env.REACT_APP_FRONTEND as string;
    }
  };

  return (
    <>
      <Grid container>
        <Grid item xs={12}>
          <NavBarMainPage socket={socket}></NavBarMainPage>
        </Grid>

        <Grid item xs={12} style={imgStyle} className="h-[100vh] w-full">
          <div className="flex flex-col justify-center items-center">
            <div
              className="md:text-lg max-w-lg md:w-[80%] md:max-w-[80%] relative overflow-x-auto p-2 mt-10 
		  rounded-lg shadow-lg bg-gradient-to-r from-orange-300 via-yellow-400 to-orange-300 "
            >
              <div className="flex items-center justify-end p-4 w-[100%]">
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
                    maxLength={15}
                    placeholder="Search for users"
                    className="block p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-100"
                    onChange={handleSearchChange}
                    id="usersearch"
                  />
                </div>
              </div>
              <div>
                <table className="md:text-lg max-w-lg w-[80%] md:w-[100%] md:max-w-[100%] text-sm text-left text-gray-500">
                  <thead className="w-full text-sm md:text-md text-black uppercase">
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
                  <tbody className="bg-gradient-to-r from-orange-300 via-yellow-400 to-orange-300">
                    {users &&
                      users.map((item, index) =>
                        (item && item.receivedFriendRequest === false) ||
                        (item && item.isFriend) ? (
                          <tr
                            key={index}
                            className="hover:bg-gray-200 hover:shadow-xl"
                          >
                            <th
                              scope="row"
                              className="flex items-center px-6 py-4 text-black whitespace-nowrap"
                            >
                              <img
                                className="w-10 h-10 rounded-full object-cover mr-3"
                                src={`${process.env.REACT_APP_BACKEND}/api/users/avatars/${item.id}`}
                                alt="user"
                              />
                              <div className="pl-3">
                                <div className="text-base font-semibold">
                                  <span className="text-black">
                                    {item.username}
                                  </span>
                                </div>
                                <div className="font-normal"></div>
                              </div>
                            </th>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="h-2.5 w-2.5 rounded-full mr-2"></div>
                                <span className="text-black italic ml-7">
                                  {item.status}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {!item.isFriend &&
                              item.sentFriendRequest === false ? (
                                <button
                                  className="font-bold text-green-600 hover:text-green-950 hover:underline"
                                  onClick={() =>
                                    handleSendFriendRequest(item.id)
                                  }
                                >
                                  Add as Friend
                                </button>
                              ) : !item.isFriend &&
                                item.sentFriendRequest === true ? (
                                <div>
                                  <span className="text-black italic">
                                    Friend Request Pending
                                  </span>
                                </div>
                              ) : (
                                <button
                                  className="font-bold text-black hover:underline hover:text-red-600"
                                  onClick={() => removeFriend(item.id)}
                                >
                                  Remove Friend
                                </button>
                              )}
                            </td>
                          </tr>
                        ) : null
                      )}
                  </tbody>
                </table>
              </div>
            </div>
            <div
              className="md:text-lg max-w-lg md:w-[80%] md:max-w-[80%] flex flex-col justify-center items-center 
		 bg-gradient-to-r from-orange-300 via-yellow-400 to-orange-300 rounded-lg shadow-lg p-3 m-2"
            >
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
