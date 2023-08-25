import React, { useEffect, useState } from "react";
import { Grid } from "@mui/material";
import NavBarMainPage from "../Navigation/NavBarMainPage";
import Footer from "../Footer";
import { Socket } from "socket.io-client";
import axios from "axios";
import { getToken } from "../../utils/Utils";

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
      const token = getToken("jwtToken");
      const response = await axios.post<{ id: string }>(
        "http://localhost:5000/api/auth/getUserID",
        { token }
      );
      setUserID(response.data);
    }

    async function getLeaders() {
      const response = await axios.post(
        `http://localhost:5000/api/users/leaderboardGet/${userID}`
      );
      setLeaders(response.data);
    }
    getUserID();
    getLeaders();
  }, [userID]);

  return (
    <>
      <Grid container className="h-[100vh]" style={imgStyle}>
        <Grid item xs={12}>
          <NavBarMainPage socket={socket}></NavBarMainPage>
        </Grid>
        <Grid item md={12}> 
          <h2 className="text-center text-4xl 2xl:text-6xl font-bold m-5 md:mt-0">Leaderboard</h2>
          <div className="shadow-md sm:rounded-lg mx-2">
            <table className="text-lg text-left text-gray-500 w-full">
              <thead className="text-sm border-2 text-gray-700 uppercase bg-gray-100 w-full">
                <tr>
                  <th scope="col" className="px-6 py-2">
                    Player
                  </th>
                  <th scope="col" className="px-6 py-2">
                    Wins
                  </th>
                  <th scope="col" className="px-6 py-2">
                    Losses
                  </th>
                  <th scope="col" className="px-6 py-2">
                    Win Ratio
                  </th>
                  <th scope="col" className=" px-6 py-2">
                    Rating
                  </th>
				  <th scope="col" className=" px-6 py-2">
                    Rank
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaders.map((leader, index) => (
                  <tr className="bg-gray-100" key={index}>
                    <th scope="row"  className="px-6 py-4 font-medium text-gray-900" >
                        {userID === leader.id ? (
                            <div>{leader.username} ⭐</div>
                          ) : (
                            <div>{leader.username}</div>
                        )}
                      </th>
                      <td className="px-6 py-4">{leader.wins}</td>
                      <td className="px-6 py-4">{leader.losses}</td>
                      <td className="px-6 py-4">
                        {" "}
                        {leader.losses === 0
                          ? leader.wins
                          : Math.round((leader.wins / leader.losses) * 100) /
                            100}
                      </td>
                      <td className="px-6 py-4">{leader.elo}</td>
                      <td className="px-6 py-4">{leader.rank}</td>
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
