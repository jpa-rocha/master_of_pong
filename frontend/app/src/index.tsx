import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";
import { BrowserRouter } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import MainPage from "./components/MainPage";
import Game from "./components/GameCanvas/Game";
import ProfilePage from "./components/Profile/Profile";
import GetUserName from "./components/ChatPage/GetUserName";
import ChatPage from "./components/ChatPage/ChatPage";
import * as socketIO from "socket.io-client";
import { Socket } from "socket.io-client";
import UserProfile from "./components/UserProfile/UserProfile";
import PrivateRoutes from "./utils/PrivateRoutes";

const URI = "http://localhost:4000";

const socket: Socket = socketIO.connect(URI);
// @ts-ignore

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<PrivateRoutes />}>
          <Route path="/game" element={<Game />} />
          <Route path="/main" element={<MainPage />} />
          {/* <Route path="/profile" element={<UserProfile userName={'Bob'} image={'./src/images/Profile/default_profile_image.jpg'} friends={[]}/>} /> */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/chat" element={<GetUserName socket={socket} />} />
          <Route path="/chatPage" element={<ChatPage socket={socket} />} />
        </Route>
        <Route path="/" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
