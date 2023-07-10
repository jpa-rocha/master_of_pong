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
  useEffect(() => {
    // fetch(`http://localhost:4000/api/user/${userName}`)
    //     .then(res => res.json())
    //     .then(data => {
    //         console.log(data);
    //         setUserEmail(data.email);
    //         setUserPassword(data.password);
    //     })
    //     .catch(err => console.log(err));
  }, []);

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <NavBarMainPage></NavBarMainPage>
        </Grid>

        <Grid item xs={12}>
          <div className="userInfo">
            <h1>Profile Page</h1>
            <div style={{ display: "flex", alignItems: "center" }}>
              <img src={profileImg} alt="profile_picture"></img>
              <button>Change Profile picture</button>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <h2 style={{ marginRight: "10px" }}>Username: {userName}</h2>
              <button>Change Username</button>
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
