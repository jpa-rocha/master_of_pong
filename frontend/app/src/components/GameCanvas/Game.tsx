import { Grid, Box } from "@mui/material";
import GameCanvas from "./GameCanvas";
import NavBarMainPage from "../Navigation/NavBarMainPage";
import Footer from "../Footer";
import { Socket } from "socket.io-client";

type GameComponentProps = {
  socket: Socket;
};

const Game: React.FC<GameComponentProps> = ({ socket }) => {
  return (
    <>
      <Grid container>
        {/* This is navigation */}

        <Grid item xs={12}>
          <div style={{ userSelect: "none" }}>
            <NavBarMainPage socket={socket}></NavBarMainPage>
          </div>
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
          <div style={{ userSelect: "none" }}>
            <Footer />
          </div>
        </Grid>
      </Grid>
    </>
  );
};

export default Game;
