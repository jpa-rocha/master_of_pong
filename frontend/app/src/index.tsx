import React, { useEffect } from "react";
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

const URI = "http://localhost:5050";

const socket: Socket = socketIO.connect(URI);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<PrivateRoutes />}>
          <Route path="/game" element={<Game/>} />
          <Route path="/main" element={<MainPage socket={socket} />} />
          {/* <Route path="/profile" element={<UserProfile userName={'Bob'} image={'./src/images/Profile/default_profile_image.jpg'} friends={[]}/>} /> */}
          <Route path="/profile" element={<ProfilePage socket={socket} />} />
          {/* <Route path="/chat" element={<GetUserName socket={socket} />} /> */}
          <Route path="/chat" element={<ChatPage socket={socket} />} />
          <Route path="/friends" element={<FriendsPage socket={socket} />} />
        </Route>
        <Route path="/" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
