import React, { useEffect, useState } from "react";
import { Grid, Box } from "@mui/material";
import NavBarMainPage from "../NavBarMainPage";
import Footer from "../Footer";
import "./profileStyle/profile.css";
import profileImg from "../../images/Profile/default_profile_image.jpg";

// interface ProfileProps {}

const ProfilePage: React.FC = () => {
  // let profileImg: HTMLImageElement = new Image();
  // profileImg.src = "../../images/Profile/default_profile_image.jpg";
  const [userName, setUserName] = useState("Bob");
  const [rank, setRank] = useState(1);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [matches, setMatches] = useState([{ result: "10-0", opponent: "Joe" }]);
  // const [profileImg, setProfileImg] = useState("../../images/Profile/default_profile_image.jpg");
  // const profileImg: string = "../../images/Profile/default_profile_image.jpg";

  const handleProfileImgChange = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
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
        setUserName(newUserName);
      }
      document.body.removeChild(dialog);
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
    // fetch(`http://localhost:4000/api/user/${userName}`)
    //     .then(res => res.json())
    //     .then(data => {
    //         console.log(data);
    //         setUserEmail(data.email);
    //         setUserPassword(data.password);
    //     })
    //     .catch(err => console.log(err));
  }, [handleProfileImgChange]);

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <NavBarMainPage></NavBarMainPage>
        </Grid>

        <Grid item xs={12}>
          <div className="userInfo">
            <h1>Profile Page</h1>
            <div style={{ display: "block", alignItems: "center" }}>
              <img src={profileImg} alt="profile_picture"></img>
              <button type="submit" onClick={handleProfileImgChange}>
                Change Profile Picture
              </button>
            </div>
            <div style={{ display: "block", alignItems: "center" }}>
              <h2 style={{ marginRight: "10px" }}>Username: {userName}</h2>
              <button type="submit" onClick={handleUserNameChange}>
                Change Username
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <h2>Rank: {rank} </h2>
              <h2>Wins: {wins} </h2>
              <h2>Losses: {losses}</h2>
            </div>
          </div>
        </Grid>
        <Grid item xs={12}>
          <div className="matchHistory">
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
          </div>
        </Grid>
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
