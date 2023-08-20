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
  }, []);

  return (
    <>
      <Grid container className="flex h-[100vh]" style={imgStyle}>
        <Grid item xs={12}>
          <NavBarMainPage></NavBarMainPage>
        </Grid>
        <Grid item xs={6} md={12}>
          <h2 className="text-center font-bold mt-5 md:mt-0">Leaderboard</h2>
          <div className="relative overflow-x-auto m-3 md:m-0 md:py-2 md:px-2 h-[60vh] ">
            <table className="w-full text-lg text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-1">
                    Player
                  </th>
                  <th scope="col" className="px-6 py-1">
                    Wins
                  </th>
                  <th scope="col" className="px-6 py-1">
                    Losses
                  </th>
                  <th scope="col" className="px-6 py-1">
                    Win Ratio
                  </th>
                  <th scope="col" className="px-6 py-1">
                    Rating
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaders.map((leader, index) => (
                  <tr className="bg-white border-b" key={index}>
                    <div key={index} style={{ display: "flex" }}>
                      <div style={{ flex: 1 }}>
                        <div>
                          {userID === leader.id ? (
                            <div>{leader.username} ⭐</div>
                          ) : (
                            <div>{leader.username}</div>
                          )}
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>wins : {leader.wins}</div>
                      <div style={{ flex: 1 }}>losses : {leader.losses}</div>
                      <div style={{ flex: 1 }}>
                        win rate :{" "}
                        {leader.losses === 0
                          ? leader.wins
                          : Math.round((leader.wins / leader.losses) * 100) /
                            100}
                      </div>
                      <div style={{ flex: 1 }}>elo : {leader.elo}</div>
                      <div style={{ flex: 1 }}>rank : {leader.rank}</div>
                    </div>
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
