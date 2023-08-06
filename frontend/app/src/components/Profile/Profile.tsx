import React, { useEffect, useState } from "react";
import { Grid } from "@mui/material";
import NavBarMainPage from "../Navigation/NavBarMainPage";
import Footer from "../Footer";
/* import "./profileStyle/profile.css"; */
import { Socket } from "socket.io-client";
import axios from "axios";
import { getToken } from "../../utils/Utils";
import PopUpGenerate2fa from "./PopUpGenerate2fa";
import PopUpTurnOff2fa from "./PopUp2faInput";
//import ProfileDetails from './ProfileDetails';

axios.defaults.baseURL = "http://localhost:5000/";

interface UserProps {
  forty_two_id: number;
  username: string;
  refresh_token: string;
  email: string;
  avatar: string;
  is_2fa_enabled: boolean;
  xp: number;
  wins: number;
  losses: number;
  rank: number;
}

interface ProfilePageProps {
  socket: Socket;
  profileID: { id: string; } | string
;
}

const ProfilePage: React.FunctionComponent<ProfilePageProps> = ({ socket, profileID }) => {
  const [userName, setUserName] = useState("");
  const [rank, setRank] = useState(0);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [ratio, setRatio] = useState(1);
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
		setWins(userData.wins);
		setLosses(userData.losses);
		setRank(userData.rank);
		if (userData.losses === 0)
			setRatio(userData.wins);
		else
			setRatio(userData.wins / userData.losses);
      }
    }
    console.log("userID = ", userID);
    getUserName();
    socket.emit("activityStatus", { userID: userID, status: "online" });
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

  const handleProfileImgChange = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const formData = new FormData();
        formData.append("file", file, file.name);
        const config = {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        };
        try {
          const response = await axios
            .post(`api/users/upload/${userID}`, formData, config)
            .then((res) => {
              console.log(res);
            });
          window.location.reload();
        } catch (error: any) {
          console.error((error as Error).message);
        }
      }
    };
    fileInput.click();
  };

  const handleUserNameChange = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    const dialog = document.createElement("div");
    dialog.classList.add("dialog");
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Enter new username";
    const okButton = document.createElement("button");
    okButton.textContent = "OK";
    okButton.addEventListener("click", () => {
      const newUserName = input.value;
      if (newUserName) {
        // update database
        setUser(newUserName);
        document.body.removeChild(dialog);
      }
    });
    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.addEventListener("click", () => {
      document.body.removeChild(dialog);
    });
    dialog.appendChild(input);
    dialog.appendChild(okButton);
    dialog.appendChild(cancelButton);
    document.body.appendChild(dialog);
    const rect = e.currentTarget.getBoundingClientRect();
    dialog.style.position = "absolute";
    dialog.style.top = `${rect.bottom}px`;
    dialog.style.left = `${rect.left}px`;
    input.focus();
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
        <Grid item xs={12}>
          <NavBarMainPage></NavBarMainPage>
        </Grid>

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
				<p>
					<span className="font-bold">Win Ratio:</span> {ratio}
				</p>
              </div>
              <div className="flex mt-1 space-x-3 py-1 md:mt-6 flex-col md:flex-row md:mt-2">
                <button
                  className="items-center px-3 py-2 text-sm text-center 
					text-white bg-red-800 rounded-lg hover:bg-red-600 focus:ring-4 focus:outline-none
					focus:ring-gray-200"
                  onClick={handleUserNameChange}>
                  Change User Name
                </button>
                <button
                  className="items-center px-4 py-2 text-sm text-center text-white bg-green-800
					border border-gray-300 rounded-lg 
					hover:bg-green-600 focus:ring-4 focus:outline-none
					focus:ring-gray-200"
                	onClick={handleProfileImgChange}>
                	Change Profile Picture
                </button>
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
        <Grid item xs={12}>
          <Footer></Footer>
        </Grid>
      </Grid>
    </>
  );
};

export default ProfilePage;
