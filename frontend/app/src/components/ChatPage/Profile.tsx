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
  // const [matches, setMatches] = useState([{ result: "10-0", opponent: "Joe" }]);
  const [match, setMatch] = useState<MatchProps[]>([]);
  const [profileImg, setProfileImg] = useState("");
  //const token: string = getToken(process.env.REACT_APP_JWT_NAME as string);
  const [userID, setUserID] = useState<{ id: string } | string>(profileID);
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
        <div className="flex relative justify-between bg-white p-10 2xl:p-20">
          <button
            className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900
					rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center"
            onClick={closeProfile}
          >
            x
          </button>
          <div
            className="flex flex-col items-center justify-around flex-wrap md:flex-row bg-yellow-50 border border-gray-200 rounded-lg shadow
							my-10 mx-4 p-10 md:my-7 md:mx-8 md:p-2"
          >
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
            </div>
          </div>

          <div className="relative overflow-x-auto m-3 md:m-0 md:py-2 md:px-2 h-[60vh] ">
            <h2 className="text-center font-bold my-5 md:mt-0">
              {" "}
              Match History
            </h2>
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
                        <div style={{ marginLeft: "5px" }}>(Disconnection)</div>
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
        </div>
      )}
    </>
  );
};

export default ProfilePageChat;
