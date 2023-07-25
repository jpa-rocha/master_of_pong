import { Grid, Box } from "@mui/material";
import calm from "../../images/CalmScorpion.gif";
//import Footer from "./Footer";
import NavBarLandingPage from "../NavBarLandingPage";
//import Chat from './Messages/Chat'
//import ChatOnGame from "./ChatOnGamePage/ChatOnGame";
import GameCanvas from "./GameCanvas";
import NavBarMainPage from "../NavBarMainPage";
import { Socket } from "socket.io-client";
import { getUserID, getToken } from "../../utils/Utils";
import { useState } from "react";

/* import * as socketIO  from "socket.io-client"; */

interface GamePageProps {
  socket: Socket;
}

const Game: React.FunctionComponent<GamePageProps> = ({ socket }) => {
  const [userID, setUserID] = useState<string>("");
  (async () => {
    setUserID(await getUserID(getToken("jwtToken")));
    socket.emit("activityStatus", { userID: userID, status: "online" });
  })();

  return (
    <>
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
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  flexDirection: "row",
                }}
              >
                {/* <div style={{ flex: 1, display: 'flex' }}>
						<Chat />
					</div> */}
                {/* <div style={{ flex: 1, display: 'flex'}}>
						<ChatOnGame socket={socket} />
					</div> */}

                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <GameCanvas />
                </div>
              </div>
            </Box>
          </Box>
        </Grid>

        {/* This is footer */}
        {/* 	<Grid item xs={12}>
				<Footer></Footer>
			</Grid> */}
      </Grid>
    </>
  );
};

export default Game;
