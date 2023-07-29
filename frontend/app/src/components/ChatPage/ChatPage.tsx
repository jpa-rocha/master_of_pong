import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import ChatBar from "./ChatBar";
import ChatBody from "./ChatBody";
import ChatFooter from "./ChatFooter";
import "./chatPageStyle/chat.css";
import { Grid, Box } from "@mui/material";
import NavBarMainPage from "../Navigation/NavBarMainPage";
import Footer from "../Footer";
import { getUserID, getToken } from "../../utils/Utils";
// import calm from "../../images/CalmScorpion.gif";

interface ChatPageProps {
  socket: Socket;
}

interface UserProps {
  forty_two_id: number;
  username: string | undefined;
  refresh_token: string;
  email: string;
  avatar: string;
  is_2fa_enabled: boolean;
  xp: number;
  id: string;
}

interface MessageProps {
  id: number,
  sender: UserProps,
  content: string,
}

const ChatPage: React.FunctionComponent<ChatPageProps> = ({ socket }) => {
  const [messages, setMessages] = useState<any[]>([]);
  let userID: string = "";

  (async () => {
    userID = await getUserID(getToken("jwtToken"));
    console.log("UserID: " + userID);
    socket.emit("activityStatus", { userID: userID, status: "online" });
  })();

  useEffect(() => {
    // socket.on("message", (data: MessageProps[]) => setMessages(data));
  }, [socket, messages]);

  return (
    <>
      <Grid container>
        {/* This is navigation */}

        <Grid item xs={12}>
          <NavBarMainPage></NavBarMainPage>
        </Grid>

        <Grid item xs={12}>
          <div className="chatPageContainer">
            <div className="chatSide">
              <ChatBar socket={socket} />
            </div>
            <div className="chatMain">
              <ChatBody socket={socket}/>
              <ChatFooter socket={socket} />
            </div>
          </div>
        </Grid>

        {/* This is footer */}
        <Grid item xs={12}>
          <Footer></Footer>
        </Grid>
      </Grid>
    </>
  );
};

export default ChatPage;
