import React, { useEffect, useState } from "react";
import { Grid } from "@mui/material";
import NavBarMainPage from "../Navigation/NavBarMainPage";
import Footer from "../Footer";
import { Socket } from "socket.io-client";
import axios from "axios";
import NameChangePopUp from "./PopUpNameChange";
import socketIO from "socket.io-client";
import { getToken } from "../../utils/Utils";

axios.defaults.baseURL = process.env.REACT_APP_BACKEND;

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

const imgStyle = {
  background:
    "linear-gradient(to right, #EA4224 0%, #c49b2b 50%, #EA4224 100%)",
};
const ProfilePage: React.FunctionComponent<ProfilePageProps> = ({
  socket,
  profileID,
}) => {
  const URI = process.env.REACT_APP_GATEWAY as string;
  socket = socketIO(URI, {
    extraHeaders: {
      [process.env.REACT_APP_JWT_NAME as string]: getToken(
        process.env.REACT_APP_JWT_NAME as string
      ),
    },
  });
  const [userName, setUserName] = useState("");
  const [rank, setRank] = useState(0);
  const [elo, setElo] = useState(0);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [ratio, setRatio] = useState(1);
  const [match, setMatch] = useState<MatchProps[]>([]);
  const [profileImg, setProfileImg] = useState("");
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
    socket.emit("activityStatus", { userID: userID, status: "online" });
  }, [userID, socket, isNameChangedPopUp]);

  useEffect(() => {
    const update = `${process.env.REACT_APP_BACKEND}/api/users/avatars/${userID}`;
    setProfileImg(update);
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
          await axios
            .post(`api/users/upload/${userID}`, formData, config)
            .catch((err) => {
              console.log("Profile picture change failed: " + err);
            });
          setProfileImg(
            `${process.env.REACT_APP_BACKEND}/api/users/avatars/${userID}`
          );
          var reader = new FileReader();
          var imgtag = document.getElementById(
            "profile_pic"
          ) as HTMLImageElement;
          if (imgtag) imgtag.title = file.name;
          reader.onload = function (event) {
            if (imgtag && event.target && event.target.result)
              imgtag.src = event.target.result as string;
          };
          reader.readAsDataURL(file);
        } catch (error: any) {
          console.log((error as Error).message);
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

  return (
    <>
      <Grid container>
        <Grid item xs={12}>
          <NavBarMainPage socket={socket}></NavBarMainPage>
        </Grid>
        <Grid item xs={12} style={imgStyle}>
          {/*  <div
            className="flex flex-col justify-center text-gray-800 p-10 "
            style={imgStyle}
          > */}
          <div
            className="flex flex-col items-center justify-center md:h-[70vh]  
			md:max-w-[100%] p-3 md:p-2 2xl:py-20"
          >
            {/*  <div className=" "> */}
            <img
              className="w-24 h-24 mb-3 rounded-full shadow-lg mt-4 object-cover"
              src={profileImg}
              alt="profile_picture"
              id="profile_pic"
            />

            <h2 className="my-1 text-lg 2xl:text-4xl font-medium text-gray-900">
              {userName}
            </h2>
            <div className="md:text-lg flex flex-row my-5 2xl:my-10">
              <p className="mx-2">
                <span className="font-bold text-gray-900">Rank:</span> {rank}{" "}
              </p>
              <p className="mx-2">
                <span className="font-bold text-gray-900">Elo:</span> {elo}{" "}
              </p>
              <p className="mx-2">
                <span className="font-bold text-gray-900">Wins:</span> {wins}{" "}
              </p>
              <p className="mx-2">
                <span className="font-bold text-gray-900">Losses:</span>{" "}
                {losses}
              </p>
              <p className="mx-2">
                <span className="font-bold text-gray-900">Win Ratio:</span>{" "}
                {ratio}
              </p>
            </div>
            <div className=" mt-2 md:mt-4 md:p-4 2xl:mt-10">
              <button
                className="items-center m-1 px-3 py-2 text-sm 2xl:text-lg text-center
					text-white bg-orange-800 rounded-lg hover:bg-black focus:outline-none"
                onClick={() => handleUserNameChange("")}
                title="must be between 3 and 15 characters"
              >
                Change Username
              </button>
              <button
                className="items-center m-1 px-4 py-2 text-sm 2xl:text-lg text-center text-white bg-green-800
					 rounded-lg hover:bg-white hover:text-black focus:outline-none"
                onClick={handleProfileImgChange}
                title="Upload Image (JPEG/PNG, max 1MB)"
              >
                Change Profile Picture
              </button>
            </div>
          </div>
          {/*  </div> */}
        </Grid>
        <Grid item xs={12} style={imgStyle}>
          <div className="flex flex-col mt-4 2xl:mt-0">
            <h2 className="text-center text-lg md:text-2xl 2xl:text-6xl font-bold m-5 md:m-10">
              Match History
            </h2>
            <div className="relative overflow-x-auto m-3 md:py-2 md:px-20 h-[50vh] md:h-[100vh]">
              <table className="w-full  text-sm md:text-md 2xl:text-lg rounded-lg shadow-xl text-left text-black">
                <thead
                  className="text-sm md:text-md 2xl:text-lg 
				  	text-black  uppercase border-1 py-2
					bg-gradient-to-r from-orange-300 via-yellow-400 to-orange-300"
                >
                  <tr>
                    <th scope="col" className="px-6 py-2">
                      Opponent
                    </th>
                    <th scope="col" className="px-6 py-2">
                      GameMode
                    </th>
                    <th scope="col" className="px-6 py-2">
                      Options
                    </th>
                    <th scope="col" className="px-6 py-2">
                      Result
                    </th>
                    <th scope="col" className="px-6 py-2">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody className="w-full bg-gradient-to-r from-orange-300 via-yellow-400 to-orange-300">
                  {match.map((match, index) => (
                    <tr className=" border-1 text-black" key={index}>
                      {userID === match.userOne.id ? (
                        <td className="px-6 py-1 font-bold">
                          {match.userTwo.username}
                        </td>
                      ) : (
                        <td className="px-6 py-1 font-bold">
                          {match.userOne.username}
                        </td>
                      )}
                      <td className="px-6 py-1 italic ">{match.gameMode}</td>
                      <td className="px-6 py-1 italic">
                        {match.gameModeOptions}
                      </td>

                      {userID === match.winner.id ? (
                        <td className="px-6 py-1 text-green-600 font-bold">
                          WIN
                        </td>
                      ) : (
                        <td className="px-6 py-1 text-red-600 font-bold">
                          LOSS
                        </td>
                      )}
                      {match.score1 !== 11 && match.score2 !== 11 ? (
                        <td className="px-6 py-1 text-red-600 font-bold">
                          (Disconnection)
                        </td>
                      ) : (
                        <td className="px-6 py-1 text-green-600 font-bold">
                          {match.score1}-{match.score2}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Grid>
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
