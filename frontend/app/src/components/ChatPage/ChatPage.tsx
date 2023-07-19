import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import ChatBar from "./ChatBar";
import ChatBody from "./ChatBody";
import ChatFooter from "./ChatFooter";
import "./chatPageStyle/chat.css";
import { Grid, Box } from "@mui/material";
import NavBarMainPage from "../NavBarMainPage";
import Footer from "../Footer";
// import calm from "../../images/CalmScorpion.gif";

interface ChatPageProps {
  socket: Socket;
}

const ChatPage: React.FunctionComponent<ChatPageProps> = ({ socket }) => {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    socket.on("message", (data: any) =>
      setMessages([...messages, data])
    );
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
              <ChatBody messages={messages} />
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
