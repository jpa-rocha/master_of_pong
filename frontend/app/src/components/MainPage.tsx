import React from "react";
import "../styles/App.css";
import { Grid, Box } from "@mui/material";
import angry from "../images/AngryScorpion.gif";
import NavBarMainPage from "./NavBarMainPage";
import Footer from "./Footer";
import { Socket } from "socket.io-client";
import { get } from "http";
import { getUserID, getToken } from "../utils/Utils";

interface MainPageProps {
  socket: Socket;
}

/* This is the Main Page after User Login */

const MainPage: React.FunctionComponent<MainPageProps> = ({ socket }) => {
  //socket.emit("activityStatus", {userID: userID, status: activityStatus});
  const [data, setData] = React.useState("");
  // const [userID, setUserID] = React.useState<string>("");
  let userID: string = "";

  React.useEffect(() => {
    fetch("https://api.intra.42.fr/v2/accreditations")
      .then((response) => response.json())
      .then((json) => setData(json))
      .catch((error) => console.error(error));
  }, []);

  (async () => {
    userID = await getUserID(getToken("jwtToken"));
    console.log("UserID: " + userID);
    socket.emit("activityStatus", { userID: userID, status: "online" });
  })();

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
              sx={{ height: "100vh" }}
            >
              <img
                src={angry}
                alt="calmScorpion"
                style={{
                  objectFit: "cover",
                  width: "100%",
                  height: "100%",
                  opacity: "0.4",
                }}
              ></img>
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

export default MainPage;
