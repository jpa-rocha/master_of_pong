import React, { useEffect, useRef, useState } from "react";
import { Grid, Box } from "@mui/material";
import NavBarMainPage from "../NavBarMainPage";
import Footer from "../Footer";
import "./profileStyle/profile.css";
// import profileImg from "../../images/Profile/default_profile_image.jpg";
import io, { Socket } from "socket.io-client";
import axios from "axios";
import { get } from "http";
import { getToken, getUserID } from "../../utils/Utils";

// interface ProfileProps {}
axios.defaults.baseURL = "http://localhost:5000/";

interface UserProps {
  forty_two_id: number;
  username: string;
  refresh_token: string;
  email: string;
  avatar: string;
  is_2fa_enabled: boolean;
  xp: number;
  id: string;
}

interface ProfilePageProps {
  socket: Socket;
}

const ProfilePage: React.FunctionComponent<ProfilePageProps> = ({ socket }) => {
  const [userName, setUserName] = useState("");
  const [rank, setRank] = useState(1);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [matches, setMatches] = useState([{ result: "10-0", opponent: "Joe" }]);
  const [profileImg, setProfileImg] = useState("");

  const token: string = getToken("jwtToken");
  const [userID, setUserID] = useState("");
  (async () => {
    try {
      setUserID(await getUserID(getToken("jwtToken")));
      socket.emit("activityStatus", { userID: userID, status: "online" });
    } catch (error) {
      console.error("Error getting user ID:", error);
    }
  })();
  console.log(`api/users/${userID}`);

  const getUser = async () => {
    if (userID === undefined) {
      console.log("Couldn't get the user");
      return <div>Loading...</div>;
    }
    console.log("Got the user");
    const user = await axios.get(`api/users/${userID}`);
    return user.data;
  };

  const setUser = async (newName: string) => {
    console.log("newName: ", newName);
    const data = { username: newName };
    const config = {
      headers: {
        "Content-Type": "application/json",
        " Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE",
      },
    };
    if (userID !== undefined) {
      console.log("data: ", data);
      await axios
        .patch(`api/users/${userID}`, data, config)
        .then((res) => res.data);
      setUserName(newName);
    }
  };

  useEffect(() => {
    const getProfile = async () => {
      const user: UserProps = await getUser();
      setUserName(user.username);
    };
    console.log("Main use Effect");
    getProfile();
  }, [userID]);

  const handleProfileImgChange = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const formData = new FormData();
        formData.append("file", file, file.name);
        const config = {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        };
        try {
          console.log(formData);
          // const data = { file: formData };
          const response = await axios
            .post(`api/users/upload/${userID}`, formData, config)
            .then((res) => {
              console.log(res);
            });
          console.log(response);
          window.location.reload();
        } catch (error: any) {
          console.error((error as Error).message);
          // console.error((error as any).response.data);
        }
      }
    };
    fileInput.click();
  };

  const handleUserNameChange = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    const dialog = document.createElement("div");
    dialog.classList.add("dialog");
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Enter new username";
    const okButton = document.createElement("button");
    okButton.textContent = "OK";
    okButton.addEventListener("click", () => {
      const newUserName = input.value;
      if (newUserName) {
        // update database
        setUser(newUserName);
        document.body.removeChild(dialog);
      }
    });
    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.addEventListener("click", () => {
      document.body.removeChild(dialog);
    });
    dialog.appendChild(input);
    dialog.appendChild(okButton);
    dialog.appendChild(cancelButton);
    document.body.appendChild(dialog);
    const rect = e.currentTarget.getBoundingClientRect();
    dialog.style.position = "absolute";
    dialog.style.top = `${rect.bottom}px`;
    dialog.style.left = `${rect.left}px`;
    input.focus();
  };

  useEffect(() => {
    setProfileImg(`http://localhost:5000/api/users/avatars/${userID}`);
  }, [handleProfileImgChange]);

  if (!userName) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Grid container>
        <Grid item xs={12}>
          <NavBarMainPage></NavBarMainPage>
        </Grid>

        <Grid item xs={12}>
          <div className="all">
            <div className="userInfo">
              <div className="img-div">
                <img src={profileImg} alt="profile_picture"></img>
                <h2>{userName}</h2>
              </div>

              <div className="ranks">
                <h2>Rank: {rank} </h2>
                <h2>Wins: {wins} </h2>
                <h2>Losses: {losses}</h2>
              </div>
              <div className="btns">
                <button type="submit" onClick={handleProfileImgChange}>
                  Change Profile Picture
                </button>
                <button type="submit" onClick={handleUserNameChange}>
                  Change Username
                </button>
              </div>
              <div className="matchHistory">
                <h2> Match History</h2>
                <table>
                  <tr>
                    <th>Opponent</th>
                    <th>Result</th>
                  </tr>
                  {matches.map((match) => (
                    <tr>
                      <td>{match.opponent}</td>
                      <td>{match.result}</td>
                    </tr>
                  ))}
                </table>
              </div>
            </div>
          </div>
        </Grid>
        {/*    <Grid item xs={12}>
		
        </Grid> */}
        {/* This is footer */}
        <Grid item xs={12}>
          <Footer></Footer>
        </Grid>
      </Grid>

      {/* <div>
        <form>
          <label>Change Password</label>
          <input type="password" />
          <button>Submit</button>
        </form>
      </div>
      <div>
        <h1> Match History</h1>
        <table>
          <tr>
            <th>Opponent</th>
            <th>Result</th>
          </tr>
          {matches.map((match) => (
            <tr>
              <td>{match.opponent}</td>
              <td>{match.result}</td>
            </tr>
          ))}
        </table>
      </div> */}
    </>
  );
};

export default ProfilePage;
