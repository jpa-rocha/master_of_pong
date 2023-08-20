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

const LeaderBoard: React.FunctionComponent<LeaderBoardPageProps> = ({ socket }) => {
	const [leaders, setLeaders] = useState<UserProps[]>([]);

return (
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
					<div key={index}>{leader.username}</div>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Grid>	
);
};
export default LeaderBoard;