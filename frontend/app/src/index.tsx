import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";
import { BrowserRouter } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import MainPage from "./components/MainPage";
import Game from "./components/GameCanvas/Game";
import ProfilePage from "./components/Profile/Profile";
import ChatPage from "./components/ChatPage/ChatPage";
import * as socketIO from "socket.io-client";
import { Socket } from "socket.io-client";
import PrivateRoutes from "./utils/PrivateRoutes";
import FriendsPage from "./components/Friends/Friends";
import PageNotFound from "./components/PageNotFound";
import LeaderBoard from "./components/LeaderBoard/LeaderBoard";
import { getToken } from "../src/utils/Utils";
import axios from "axios";

axios.defaults.baseURL = process.env.REACT_APP_BACKEND;
const URI = process.env.REACT_APP_GATEWAY as string;
const socket: Socket = socketIO.connect(URI);

async function getUserID() {
  console.log("INDEX GET USERID");
  console.log("-----URI: ", URI);
  const token = getToken(process.env.REACT_APP_JWT_NAME as string);
  console.log(token);
  const response = await axios.post<{ id: string }>(
    `${process.env.REACT_APP_BACKEND}/api/auth/getUserID`,
    { token }
  );
  return response.data;
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

(async () => {
  const userID = await getUserID();
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <Routes>
          <Route element={<PrivateRoutes />}>
            <Route path="/game" element={<Game socket={socket} />} />
            <Route path="/main" element={<MainPage socket={socket} />} />
            <Route
              path="/profile"
              element={<ProfilePage socket={socket} profileID={userID} />}
            />
            <Route path="/chat" element={<ChatPage socket={socket} />} />
            <Route path="/friends" element={<FriendsPage socket={socket} />} />
            <Route path="/leaders" element={<LeaderBoard socket={socket} />} />
          </Route>
          <Route path="/" element={<App />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </BrowserRouter>
    </React.StrictMode>
  );
})();
