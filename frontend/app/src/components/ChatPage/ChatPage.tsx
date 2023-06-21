import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import ChatBar from "./ChatBar";
import ChatBody from "./ChatBody";
import ChatFooter from "./ChatFooter";
import "./chatPageStyle/chat.css";
import { Grid, Box } from "@mui/material";
import NavBarLandingPage from "../NavBarLandingPage";
import Footer from "../Footer";
import calm from "../../images/CalmScorpion.gif";

interface ChatPageProps {
  socket: Socket;
}

const ChatPage: React.FunctionComponent<ChatPageProps> = ({ socket }) => {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    socket.on("messageResponse", (data: any) =>
      setMessages([...messages, data])
    );
  }, [socket, messages]);

  return (
    <>
      <Grid container>
        {/* This is navigation */}

        {/* <Grid item xs={12}>
          <NavBarLandingPage></NavBarLandingPage>
        </Grid> */}

        {/* This is main */}
        <Grid item xs={12}>
          <Box
            // display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{
              overflow: "hidden",
              height: "100vh",
              position: "relative",
              flexGrow: 1,
              background:
                "linear-gradient(to right, #EA4224 0%, #EDC24F 50%, #EA4224 100%)",
            }}
          >
            {/* <img
                src={calm}
                alt="calmScorpion"
                style={{
                  objectFit: "cover",
                  width: "100%",
                  height: "100%",
                  opacity: "0.4",
                }}
              ></img> */}

            <Box
              // justifyContent="center"
              // alignItems="center"
              sx={{
                
                // height: "10vh",
                // position: "absolute",
                // top: "50%",
                // left: "50%",
                // transform: "translate(-50%, -50%)",
                // flexGrow: 1,
              }}
            >
              {/* <div
                style={{
                  // display: "flex",
                  position: "relative",
                  // top: "50px",
                  // left: 0,
                  // right: 0,
                  // bottom: 0,
                  flexDirection: "row",
                  // flex: 1,
                  // display: "flex",
                  // justifyContent: "center",
                  // alignItems: "center",
                }}
              > */}
              <>
                <div className="chatPageContainer">
                  <div className="chatSide">
                    <ChatBar socket={socket} />
                  </div>
                  <div className="chatMain">
                    <ChatBody messages={messages} />
                    <ChatFooter socket={socket} />
                  </div>
                </div>
              </>
              {/* </div> */}
            </Box>
          </Box>
        </Grid>

        {/* This is footer */}
        {/* <Grid item xs={12}>
          <Footer></Footer>
        </Grid> */}
      </Grid>
    </>
  );
};

export default ChatPage;
