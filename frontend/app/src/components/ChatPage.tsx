import React from "react";
import "../styles/App.css";
import { Grid, Box } from "@mui/material";
import calm from "../images/CalmScorpion.gif";
import NavBarMainPage from "./NavBarMainPage";
import Footer from "./Footer";
import ChatBar from "./ChatPage/ChatBar";
import ChatBody from "./ChatPage/ChatBody";
import ChatFooter from "./ChatPage/ChatFooter";
import * as socketIO from "socket.io-client";
import { Socket } from "socket.io-client";

const URI = "http://localhost:4000";

const socket: Socket = socketIO.connect(URI);
const messages: any[] = [];

const ChatPage: React.FunctionComponent = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <Grid container>
        {/* This is navigation */}
        <Grid item xs={12}>
          <NavBarMainPage></NavBarMainPage>
        </Grid>

        {/* This is main */}
        <Grid item xs={12}>
          <Box
            sx={{
              flexGrow: 1,
              background:
                "linear-gradient(to right, #EA4224 0%, #EDC24F 50%, #EA4224 100%)",
            }}
          >
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              sx={{ height: "100vh", position: "relative" }}
            >
              <img
                src={calm}
                alt="calmScorpion"
                style={{
                  objectFit: "cover",
                  width: "100%",
                  height: "100%",
                  opacity: "0.4",
                }}
              ></img>

              <div
                style={{
                  display: "flex",
                  position: "absolute",
                  top: 100,
                  left: 100,
                  right: 100,
                  bottom: 200,
                  flexDirection: "row",
                }}
              >
                <div
                  style={{
                    flex: 2,
                  }}
                >
                  <div style={{ height: 100 }}>
                    <ChatBar socket={socket} />
                  </div>
                  <div style={{ height: 100 }}>
                    <ChatBody messages={messages} />
                  </div>
                  <div style={{ height: 100 }}>
                    <ChatFooter socket={socket} />
                  </div>
                </div>
              </div>
            </Box>
          </Box>
        </Grid>

        {/* This is footer */}
        <Grid item xs={12}>
          <Footer></Footer>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ChatPage;
