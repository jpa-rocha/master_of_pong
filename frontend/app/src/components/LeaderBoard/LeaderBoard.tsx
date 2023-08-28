import React, { useEffect, useState } from "react";
import { Grid } from "@mui/material";
import NavBarMainPage from "../Navigation/NavBarMainPage";
import Footer from "../Footer";
import { Socket } from "socket.io-client";
import axios from "axios";
import { getToken, AxiosConfig } from "../../utils/Utils";

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

interface LeaderBoardPageProps {
  socket: Socket;
}

const imgStyle = {
  background:
    "linear-gradient(to right, #EA4224 0%, #c49b2b 50%, #EA4224 100%)",
};

const LeaderBoard: React.FunctionComponent<LeaderBoardPageProps> = ({
  socket,
}) => {
  const [leaders, setLeaders] = useState<UserProps[]>([]);
  const [userID, setUserID] = useState<{ id: string } | string>();

  useEffect(() => {
    async function getUserID() {
      const token = getToken(process.env.REACT_APP_JWT_NAME as string);
      const response = await axios.post<{ id: string }>(
        `${process.env.REACT_APP_BACKEND}/api/auth/getUserID`,
        { token }
      );
      setUserID(response.data);
    }

    async function getLeaders() {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND}/api/users/leaderboardGet/${userID}`,
        AxiosConfig
      );
      setLeaders(response.data);
    }
    getUserID();
    getLeaders();
  }, [userID]);

  return (
    <>
      <Grid container>
        <Grid item xs={12}>
          <NavBarMainPage socket={socket}></NavBarMainPage>
        </Grid>
        <Grid item md={12} className="h-screen w-full" style={imgStyle}>
          <h2 className="text-center text-4xl 2xl:text-6xl 2xl:mt-20 2xl:mb-10 font-bold my-7 md:my-10">
            Leaderboard
          </h2>
          <div className="overflow-x-auto mx-2 flex flex-col justify-center items-center">
            <table className="md:text-lg max-w-md md:w-[80%] md:max-w-[80%] text-left rounded-lg shadow-xl">
              <thead
                className="text-sm md:text-lg 2xl:text-xl uppercase 
			  rounded-lg shadow-xl bg-gradient-to-r from-orange-300 via-yellow-400 to-orange-300"
              >
                <tr>
                  <th scope="col" className="pl-20 py-3">
                    Player
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Wins
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Losses
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Win Ratio
                  </th>
                  <th scope="col" className=" px-6 py-3">
                    Rating
                  </th>
                  <th scope="col" className=" px-6 py-3">
                    Rank
                  </th>
                </tr>
              </thead>
              <tbody className="bg-yellow-100">
                {leaders.map((leader, index) => (
                  <tr
                    className="rounded-lg shadow-lg bg-gradient-to-r from-orange-300 via-yellow-400 to-orange-300"
                    key={index}
                  >
                    <th
                      scope="row"
                      className="text-sm md:text-lg px-6 py-3 font-medium text-gray-900"
                    >
                      {userID === leader.id ? (
                        <div className="flex flex-row">
                          <img
                            src={`${process.env.REACT_APP_BACKEND}/api/users/avatars/${leader.id}`}
                            alt={leader.username}
                            className="w-10 h-10 rounded-full object-cover mr-3"
                          />
                          <p className="text-sm md:text-lg 2xl:text-2xl italic">
                            {leader.username} ⭐
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-row">
                          <img
                            src={`${process.env.REACT_APP_BACKEND}/api/users/avatars/${leader.id}`}
                            alt={leader.username}
                            className="w-10 h-10 rounded-full object-cover mr-3"
                          />
                          <p className="text-center text-sm md:text-lg 2xl:text-2xl italic">
                            {leader.username}
                          </p>
                        </div>
                      )}
                    </th>
                    <td className="px-6 py-3 text-sm md:text-lg 2xl:text-2xl">
                      {leader.wins}
                    </td>
                    <td className="px-6 py-3 text-sm md:text-lg 2xl:text-2xl">
                      {leader.losses}
                    </td>
                    <td className="px-6 py-3 text-sm md:text-lg 2xl:text-2xl">
                      {" "}
                      {leader.losses === 0
                        ? leader.wins
                        : Math.round((leader.wins / leader.losses) * 100) / 100}
                    </td>
                    <td className="px-6 py-3 text-sm md:text-lg 2xl:text-2xl">
                      {leader.elo}
                    </td>
                    <td className="px-6 py-3 text-sm md:text-lg 2xl:text-2xl">
                      {leader.rank}
                    </td>
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
export default LeaderBoard;
