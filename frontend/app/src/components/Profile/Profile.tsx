import React, { useEffect, useState } from "react";
import { Grid } from "@mui/material";
import NavBarMainPage from "../Navigation/NavBarMainPage";
import Footer from "../Footer";
import { Socket } from "socket.io-client";
import axios from "axios";
import { getToken } from "../../utils/Utils";
import NameChangePopUp from "./PopUpNameChange";

axios.defaults.baseURL = "http://localhost:5000/";

interface UserProps {
  id: string;
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
  elo: number;
}

interface MatchProps {
  id: number;
  timestamp: Date;
  userOne: UserProps;
  userTwo: UserProps;
  winner: UserProps;
  gameMode: string;
  gameModeOptions: string;
  score1: number;
  score2: number;
}

interface ProfilePageProps {
  socket: Socket;
  profileID: { id: string } | string;
}

const ProfilePage: React.FunctionComponent<ProfilePageProps> = ({
  socket,
  profileID,
}) => {
  const [userName, setUserName] = useState("");
  const [rank, setRank] = useState(0);
  const [elo, setElo] = useState(0);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [ratio, setRatio] = useState(1);
  // const [matches, setMatches] = useState([{ result: "10-0", opponent: "Joe" }]);
  const [match, setMatch] = useState<MatchProps[]>([]);
  const [profileImg, setProfileImg] = useState("");
  const token: string = getToken("jwtToken");
  const [userID, setUserID] = useState<{ id: string } | string>(profileID);
  const [isNameChangedPopUp, setIsNameChangedPopUp] = useState(false);

  useEffect(() => {
    async function getUserName() {
      if (userID) {
        const user = await axios.get(`api/users/${userID}`);
        const userData: UserProps = user.data;
        setUserID(userData.id);
        setUserName(userData.username);
        setUserName(userData.username);
        setWins(userData.wins);
        setLosses(userData.losses);
        setRank(userData.rank);
        setElo(userData.elo);
        if (userData.losses === 0) setRatio(userData.wins);
        else {
          const temp = userData.wins / userData.losses;
          setRatio(Math.round(temp * 100) / 100);
        }
      }
    }

    async function getMatches() {
      if (userID) {
        const userMatches = await axios.get(`api/game-data/${userID}`);
        setMatch(userMatches.data);
      }
    }
    getUserName();
    getMatches();
    console.log("Matches = ", match);
    socket.emit("activityStatus", { userID: userID, status: "online" });
  }, [userID, socket, isNameChangedPopUp]);

  // const setUser = async (newName: string) => {
  //   console.log("SetUser function called");
  //   const data = { username: newName };
  //   const config = {
  //     headers: {
  //       "Content-Type": "application/json",
  //       "Access-Control-Allow-Origin": "https://localhost:3000",
  //       "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE",
  //     },
  //   };
  //   if (userID !== undefined) {
  //     const response = await axios.patch(`api/users/${userID}`, data, config);
  //     setUserName(newName);
  //   }
  // };

  useEffect(() => {
    setProfileImg(`http://localhost:5000/api/users/avatars/${userID}`);
  }, [userID]);

  if (!userName) {
    return <div>Loading...</div>;
  }
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
        if (file.size > 1024 * 1024) {
          console.error("File size exceeds 1MB limit");
          alert("File size exceeds 1MB limit");
          return;
        }
        if (file.size < 50 * 50) {
          console.error("File size is less than 50x50 limit");
          alert("File size is less than 50x50 limit");
          return;
        }
        if (!["image/png", "image/jpeg", "image/gif"].includes(file.type)) {
          console.error("File type not supported");
          alert("File type not supported");
          return;
        }
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
              alert(res.data.message);
              // if (res.status === 200)
              //   console.log("Profile picture changed successfully");
              // if (res.status === 403)
              //   console.log("Profile picture change failed");
            })
            .catch((err) => {
              console.log("Profile picture change failed");
            });
          window.location.reload();
        } catch (error: any) {
          console.error((error as Error).message);
        }
      }
    };
    fileInput.click();
  };

  const handleUserNameChange = (newName: string) => {
    setIsNameChangedPopUp(!isNameChangedPopUp);
    if (newName.length > 0) {
      setUserName(newName);
    }
  };
  // const handleUserNameChange = (
  //   e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  // ) => {
  //   e.preventDefault();
  //   const dialog = document.createElement("div");
  //   dialog.classList.add("dialog");
  //   const input = document.createElement("input");
  //   input.maxLength = 15;
  //   input.type = "text";
  //   input.placeholder = "Enter new username";
  //   const okButton = document.createElement("button");
  //   okButton.textContent = "OK";
  //   okButton.addEventListener("click", () => {
  //     const newUserName = input.value;
  //     if (newUserName) {
  //       // update database
  //       setUser(newUserName);
  //       document.body.removeChild(dialog);
  //     }
  //   });
  //   const cancelButton = document.createElement("button");
  //   cancelButton.textContent = "Cancel";
  //   cancelButton.addEventListener("click", () => {
  //     document.body.removeChild(dialog);
  //   });
  //   dialog.appendChild(input);
  //   dialog.appendChild(okButton);
  //   dialog.appendChild(cancelButton);
  //   document.body.appendChild(dialog);
  //   const rect = e.currentTarget.getBoundingClientRect();
  //   dialog.style.position = "absolute";
  //   dialog.style.top = `${rect.bottom}px`;
  //   dialog.style.left = `${rect.left}px`;
  //   input.focus();
  // };

  return (
    <>
      <Grid container>
        <Grid item xs={12}>
          <NavBarMainPage socket={socket}></NavBarMainPage>
        </Grid>

        <div className="flex flex-col md:h-[80vh] text-gray-800 px-[2rem] py-[4rem] md:flex-row">
          <Grid item xs={6} md={12}>
            <div
              className="flex flex-col items-center justify-around flex-wrap md:flex-row bg-yellow-50 border border-gray-200 rounded-lg shadow
			my-10 mx-4 p-10 md:my-7 md:mx-8 md:p-2 "
            >
              <img
                className="md:h-auto md:w-[20%] md:rounded-l-lg md:rounded-r-lg"
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
                    <span className="font-bold">Elo:</span> {elo}{" "}
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
                    onClick={() => handleUserNameChange("")}
                    title="must be between 3 and 15 characters"
                  >
                    Change Username
                  </button>
                  <button
                    className="items-center px-4 py-2 text-sm text-center text-white bg-green-800
					border border-gray-300 rounded-lg
					hover:bg-green-600 focus:ring-4 focus:outline-none
					focus:ring-gray-200"
                    onClick={handleProfileImgChange}
                    title="Upload Image (JPEG/PNG, max 1MB)"
                  >
                    Change Profile Picture
                  </button>
                </div>
              </div>
            </div>
          </Grid>
          <Grid item xs={6} md={12}>
            <h2 className="text-center font-bold mt-5 md:mt-0">
              {" "}
              Match History
            </h2>
            <div className="relative overflow-x-auto m-3 md:m-0 md:py-2 md:px-2 h-[60vh] ">
              <table className="w-full text-lg text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-1">
                      Opponent
                    </th>
                    <th scope="col" className="px-6 py-1">
                      GameMode
                    </th>
                    <th scope="col" className="px-6 py-1">
                      Options
                    </th>
                    <th scope="col" className="px-6 py-1">
                      Result
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {match.map((match, index) => (
                    <tr className="bg-white border-b" key={index}>
                      {userID === match.userOne.id ? (
                        <td className="px-6 py-1">{match.userTwo.username}</td>
                      ) : (
                        <td className="px-6 py-1">{match.userOne.username}</td>
                      )}
                      <td className="px-6 py-1">{match.gameMode}</td>
                      <td className="px-6 py-1">{match.gameModeOptions}</td>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        {userID === match.winner.id ? (
                          <td
                            className="px-6 py-1"
                            style={{ marginRight: "5px", color: "green" }}
                          >
                            WIN
                          </td>
                        ) : (
                          <td
                            className="px-6 py-1"
                            style={{ marginRight: "5px", color: "red" }}
                          >
                            LOSS
                          </td>
                        )}

                        {match.score1 !== 11 && match.score2 !== 11 ? (
                          <div style={{ marginLeft: "5px" }}>
                            (Disconnection)
                          </div>
                        ) : (
                          <div style={{ marginLeft: "5px" }}>
                            {match.score1}-{match.score2}
                          </div>
                        )}
                      </div>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Grid>
        </div>
        <Grid item xs={12}>
          <Footer></Footer>
        </Grid>
      </Grid>
      {isNameChangedPopUp && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <NameChangePopUp
            isOpen={isNameChangedPopUp}
            onClose={handleUserNameChange}
            UserId={userID}
          />
        </div>
      )}
    </>
  );
};

export default ProfilePage;
