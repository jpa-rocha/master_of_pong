import { Grid, Box } from "@mui/material";
import calm from "../../images/CalmScorpion.gif";
//import Footer from "./Footer";
//import Chat from './Messages/Chat'
//import ChatOnGame from "./ChatOnGamePage/ChatOnGame";
import GameCanvas from "./GameCanvas";
import NavBarMainPage from "../Navigation/NavBarMainPage";
import Footer from "../Footer";
import { Socket } from "socket.io-client";
import { getUserID, getToken } from "../../utils/Utils";
//import { useState } from "react";

/* import * as socketIO  from "socket.io-client"; */

// interface GamePageProps {
//   socket: Socket;
// }
type GameComponentProps = {
  socket: Socket;
};

const Game: React.FC<GameComponentProps> = ({ socket }) => {
  // const [userID, setUserID] = useState<string>("");
  // (async () => {
  //   setUserID(await getUserID(getToken(process.env.REACT_APP_JWT_NAME as string)));
  //   socket.emit("activityStatus", { userID: userID, status: "online" });
  // })();

  return (
    <>
      <Grid container>
        {/* This is navigation */}

        <Grid item xs={12}>
          <NavBarMainPage socket={socket}></NavBarMainPage>
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
              sx={{ height: "87vh", position: "relative" }}
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
                  <GameCanvas socket={socket} />
                </div>
              </div>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Footer />
        </Grid>
      </Grid>
    </>
  );
};

export default Game;
