import React, { useEffect, useState } from "react";
import { Grid } from "@mui/material";
/* import "./profileStyle/profile.css"; */
import { Socket } from "socket.io-client";
import axios from "axios";
import { getToken } from "../../utils/Utils";

axios.defaults.baseURL = "http://localhost:5000/";

interface UserProps {
  forty_two_id: number;
  username: string;
  refresh_token: string;
  email: string;
  avatar: string;
  is_2fa_enabled: boolean;
  xp: number;
}

interface ProfilePageProps {
  socket: Socket;
  profileID: { id: string; } | string
;
}

const ProfilePageChat: React.FunctionComponent<ProfilePageProps> = ({ socket, profileID }) => {
  const [userName, setUserName] = useState("");
  const [rank, setRank] = useState(1);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [matches, setMatches] = useState([{ result: "10-0", opponent: "Joe" }]);
  const [profileImg, setProfileImg] = useState("");
  const token: string = getToken("jwtToken");
  const [userID, setUserID] = useState<{ id: string; } | string >(profileID);

  console.log("ProfileID = ", profileID);

  useEffect(() => {
    async function getUserName() {
      console.log("userID (getUserName()) = ", userID);
      if (userID) {
        const user = await axios.get(`api/users/${userID}`);
        const userData: UserProps = user.data;
        setUserName(userData.username);
      }
    }
    console.log("userID = ", userID);
    getUserName();
  }, [userID, socket]);

  const setUser = async (newName: string) => {
    console.log("SetUser function called");
    const data = { username: newName };
    const config = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://localhost:3000",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE",
      },
    };
    if (userID !== undefined) {
      console.log("userID (setUser()) = ", userID);
      const response = await axios.patch(`api/users/${userID}`, data, config);
      console.log("response data: ", response.data);
      setUserName(newName);
    }
  };

  useEffect(() => {
    setProfileImg(`http://localhost:5000/api/users/avatars/${userID}`);
  }, [userID]);

  if (!userName) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Grid container>

        <Grid item xs={6} md={12} >
        <div
            className="flex flex-col items-center justify-around flex-wrap md:flex-row bg-yellow-50 border border-gray-200 rounded-lg shadow
			my-10 mx-4 p-10 md:my-7 md:mx-8 md:p-2 ">
            <img
              className="md:h-auto md:w-[20%] md:rounded-l-lg"
              src={profileImg}
              alt="profile_picture"
            />
            <div className="flex flex-col items-center md:p-4">
              <h2 className="mb-1 md:text-xl font-medium text-gray-900">
                {userName}
              </h2>
              <div className="md:text-lg text-gray-500 flex flex-col mt-3">
                <p>
                  <span className="font-bold">Rank:</span> {rank}{" "}
                </p>
                <p>
                  <span className="font-bold">Wins:</span> {wins}{" "}
                </p>
                <p>
                  <span className="font-bold">Losses:</span> {losses}
                </p>
              </div>
            </div>
        </div>
        </Grid>
        <Grid item xs={6} md={12}>
          <h2 className="text-center font-bold mt-5 md:mt-0"> Match History</h2>
          <div className="relative overflow-x-auto m-3 md:m-0 md:py-2 md:px-2 h-[60vh] ">
            <table className="w-full text-lg text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-1">
                    Opponent
                  </th>
                  <th scope="col" className="px-6 py-1">
                    Result
                  </th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match, index) => (
                  <tr className="bg-white border-b" key={index}>
                    <td className="px-6 py-1">{match.opponent}</td>
                    <td className="px-6 py-1">{match.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Grid>
      </Grid>
    </>
  );
};

export default ProfilePageChat;
