import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import axios from "axios";

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
  profileToggle: boolean;
  setProfileToggle: (value: boolean) => void;
}

const ProfilePageChat: React.FunctionComponent<ProfilePageProps> = ({
  socket,
  profileID,
  profileToggle,
  setProfileToggle,
}) => {
  const [userName, setUserName] = useState("");
  const [rank, setRank] = useState(1);
  const [elo, setElo] = useState(0);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [ratio, setRatio] = useState(1);
  const [match, setMatch] = useState<MatchProps[]>([]);
  const [profileImg, setProfileImg] = useState("");
  const [userID] = useState<{ id: string } | string>(profileID);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    async function getUserName() {
      if (userID) {
        const user = await axios.get(`api/users/${userID}`);
        const userData: UserProps = user.data;
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
  }, [userID, socket]);

  // const setUser = async (newName: string) => {
  //   const data = { username: newName };
  //   const config = {
  //     headers: {
  //       "Content-Type": "application/json",
  //       "Access-Control-Allow-Origin": process.env.REACT_APP_FRONTEND,
  //       "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE",
  //     },
  //   };
  //   if (userID !== undefined) {
  //     await axios.patch(`api/users/${userID}`, data, config);
  //     setUserName(newName);
  //   }
  // };

  const closeProfile = () => {
    setIsOpen(!isOpen);
    setProfileToggle(!profileToggle);
  };

  useEffect(() => {
    setProfileImg(
      `${process.env.REACT_APP_BACKEND}/api/users/avatars/${userID}`
    );
  }, [userID]);

  if (!userName) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {isOpen && (
        <div className=" flex relative justify-center gap-10 2-[90%] 2xl:gap-20 bg-gray-100 py-10 2xl:w-[80%] 2xl:p-20 
		bg-gradient-to-r from-orange-400 via-yellow-300 to-orange-400 rounded-lg shadow-lg">
          <button
            className="absolute top-3 right-2.5 text-black bg-transparent hover:bg-black hover:text-gray-50
					rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center"
            onClick={closeProfile}
          >
            x
          </button>
          <div
            className="flex flex-col items-center rounded-lg shadow-lg
							my-10 mx-4 p-10 md:my-7 md:mx-8 md:p-2"
          >
            <img
              className="w-24 h-24 mb-3 rounded-full shadow-lg mt-4 object-cover"
              src={profileImg}
              alt="profile_picture"
            />
            <h2 className="my-1 text-lg 2xl:text-4xl font-medium text-gray-900">
              {userName}
            </h2>
            <div className="md:text-lg flex flex-row my-10">
              <p className="mx-2">
                <span className="font-bold text-gray-600">Rank:</span> {rank}{" "}
              </p>
              <p className="mx-2">
                <span className="font-bold text-gray-600">Elo:</span> {elo}{" "}
              </p>
              <p className="mx-2">
                <span className="font-bold text-gray-600">Wins:</span> {wins}{" "}
              </p>
              <p className="mx-2">
                <span className="font-bold text-gray-600">Losses:</span>{" "}
                {losses}
              </p>
              <p className="mx-2">
                <span className="font-bold text-gray-600">Win Ratio:</span>{" "}
                {ratio}
              </p>
            </div>
          </div>

          <div className="relative overflow-x-auto m-3 md:m-1 md:py-2 md:px-10 2xl:px-0 h-[60vh] 
		  bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-300 rounded-lg shadow-lg ">
            <h2 className="text-center font-bold my-5 md:mt-0">
              {" "}
              Match History
            </h2>
            <table className="w-full text-md text-left">
              <thead className="text-xs text-black  uppercase">
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
                  <th scope="col" className="px-6 py-1">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {match.map((match, index) => (
                  <tr className="" key={index}>
                    {userID === match.userOne.id ? (
                      <td className="px-6 py-1 font-bold">{match.userTwo.username}</td>
                    ) : (
                      <td className="px-6 py-1 font-bold">{match.userOne.username}</td>
                    )}
                    <td className="px-6 py-1 italic">{match.gameMode}</td>
                    <td className="px-6 py-1 italic">{match.gameModeOptions}</td>
                    {userID === match.winner.id ? (
                      <td className="px-6 py-1  text-green-600 font-bold">WIN</td>
                    ) : (
                      <td className="px-6 py-1 text-red-600 font-bold">LOSS</td>
                    )}
                    {match.score1 !== 11 && match.score2 !== 11 ? (
                      <td className="px-6 py-1 text-red-600 font-bold text-center">
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
      )}
    </>
  );
};

export default ProfilePageChat;
