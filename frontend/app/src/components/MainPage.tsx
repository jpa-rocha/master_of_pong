import React from "react";
import { Grid } from "@mui/material";
import angry from "../images/AngryScorpion.gif";
import NavBarMainPage from "./Navigation/NavBarMainPage";
import Footer from "./Footer";
import { Socket } from "socket.io-client";
import { getUserID, getToken } from "../utils/Utils";

interface MainPageProps {
  socket: Socket;
}

const imgStyle = {
  background:
    "linear-gradient(to right, #EA4224 0%, #EDC24F 50%, #EA4224 100%)",
};

/* This is the Main Page after User Login */

const MainPage: React.FunctionComponent<MainPageProps> = ({ socket }) => {
  //socket.emit("activityStatus", {userID: userID, status: activityStatus});
  // const [data, setData] = React.useState("");
  // const [userID, setUserID] = React.useState<string>("");
  let userID: string = "";

  // React.useEffect(() => {
  //   fetch("https://api.intra.42.fr/v2/accreditations")
  //     .then((response) => response.json())
  //     .then((json) => setData(json))
  //     .catch((error) => console.error(error));
  // }, []);

  (async () => {
    userID = await getUserID(getToken("jwtToken"));
    socket.emit("activityStatus", { userID: userID, status: "online" });
  })();

  return (
    <Grid container>
      <Grid item xs={12}>
        <NavBarMainPage socket={socket}></NavBarMainPage>
      </Grid>
      <Grid item xs={12}>
        <div className="relative h-[100vh]">
          <img className="w-full h-full" src={angry} alt="angry"></img>
          <div className="absolute inset-0 opacity-50" style={imgStyle}></div>
        </div>
      </Grid>
      <Grid item xs={12}>
        <Footer></Footer>
      </Grid>
    </Grid>
  );
};

export default MainPage;
