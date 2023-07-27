import React, { useEffect } from "react";
import { AppBar, Toolbar, Typography, Box, Avatar, Stack } from "@mui/material";
import logo from "../images/logo.png";
import { useNavigate } from "react-router-dom";
import { getToken, getUser, getUserID } from "../utils/Utils";
import { get } from "http";
// import { use } from "passport";

/* This is the Navigation Section for the Main Page */
const NavBarMainPage = () => {
  const navigate = useNavigate();
  const [userID, setUserID] = React.useState<string>("");
  const [profileImg, setProfileImg] = React.useState<string>("");

  (async () => {
    setUserID(await getUserID(getToken("jwtToken")));
  })();
  useEffect(() => {
    console.log("UserID: " + userID);
    setProfileImg(`http://localhost:5000/api/users/avatars/${userID}`);
    console.log("Profile Image: " + profileImg);
  }, [userID]);

  const getName = (value: String) => {
    return `${value.split(" ")[0][0]}${value.split(" ")[1][0]}`;
  };

  const handleGame = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/game");
  };

  const handleChat = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/chat");
  };

  const handleUserProfile = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/profile");
  };

  const handleUserMain = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/main");
  };

  return (
    <Box>
      <AppBar
        position="fixed"
        style={{ backgroundColor: "#09090C", height: "6vh", minHeight: "70px" }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            sx={{ cursor: "pointer" }}
            style={{ cursor: "pointer" }}
            onClick={handleUserMain}
          >
            Main
          </Typography>

          <div style={{ flexGrow: 1, textAlign: "center" }}>
            <Box
              component="img"
              alt="Logo"
              src={logo}
              sx={{ height: 70 }}
            ></Box>
          </div>

          <Stack direction="row" spacing={3}>
            <Typography
              onClick={handleGame}
              variant="h6"
              style={{ cursor: "pointer" }}
            >
              Play
            </Typography>
            <Typography
              onClick={handleChat}
              variant="h6"
              style={{ cursor: "pointer" }}
            >
              Chat
            </Typography>
            <a
              href="http://localhost:5000/api/auth/signout"
              style={{ textDecoration: "none", color: "white" }}
            >
              <Typography variant="h6" style={{ cursor: "pointer" }}>
                Logout{" "}
              </Typography>
            </a>
            <Avatar
              alt="profile_picture"
              src={profileImg}
              // sx={{ bgcolor: "#fff", color: "#000", cursor: "pointer" }}
              // children={getName("User Name")}
              onClick={handleUserProfile}
            />
          </Stack>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default NavBarMainPage;
