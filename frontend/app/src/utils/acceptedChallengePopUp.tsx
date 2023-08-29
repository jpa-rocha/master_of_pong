import React, { useEffect, useState } from "react";
import "./PopUp.css";
import { Socket } from "socket.io-client";
import axios from "axios";

axios.defaults.baseURL = process.env.REACT_APP_BACKEND;

type ChallengePopupProps = {
  isOpen: boolean;
  onClose: () => void;
  userID: string;
  targetID: string;
  socket: Socket;
};

const ChallengeRoomPopup: React.FC<ChallengePopupProps> = ({
  socket,
  userID,
  targetID,
  onClose,
}) => {
  const [masterToggle, setMasterToggle] = useState<boolean>(false);

  const handleModeSelectionChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedValue = event.target.value;
    if (selectedValue === "masterofpong") setMasterToggle(true);
    else setMasterToggle(false);
  };

  return (
    <>
      <div>
        <h3 className="PopHeader">Challenge</h3>
        <div className="PopBody">
          {/* Button Part : Create, Cancel */}
          <div>
            <label htmlFor="gamemode">Choose a gamemode:</label>
          </div>
          <div>
            <select
              name="gamemode"
              id="gamemode"
              onChange={handleModeSelectionChange}
            >
              <option value="regular">Regular</option>
              <option value="masterofpong">Master of Pong</option>
            </select>
          </div>
          <div>
            <label htmlFor="options">Choose options:</label>
          </div>
          <div>
            <input type="checkbox" id="hyper" value="hyper"></input>
            <label style={{ marginRight: "10px" }} htmlFor="hyper">
              {" "}
              Hyper Mode
            </label>
            <input type="checkbox" id="dodge" value="dodge"></input>
            <label htmlFor="dodge"> Dodgeball</label>
          </div>

          {masterToggle ? (
            <>
              <div>
                <label htmlFor="character">Choose a character:</label>
              </div>
              <div>
                <select name="character" id="character">
                  <option value="random">Random</option>
                  <option value="venomtail">Venomtail</option>
                  <option value="belowzero">BelowZero</option>
                  <option value="raiven">Raiven</option>
                </select>
              </div>
            </>
          ) : null}

          <div className="button-container">
            <button className="create-button">Challenge</button>
            <button className="cancel-button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChallengeRoomPopup;
