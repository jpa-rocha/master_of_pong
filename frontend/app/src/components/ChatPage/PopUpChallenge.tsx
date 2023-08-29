import React, { useEffect, useState } from "react";
import "./PopUp.css";
import { Socket } from "socket.io-client";
import { Character } from "../GameCanvas/enums/Characters";
import { Mode } from "../GameCanvas/enums/Modes";
import { Paddles } from "../GameCanvas/enums/Paddles";
import { useNavigate } from "react-router-dom";

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
  const [challengeSent, setChallengeSent] = useState<boolean>(false);
  const [mode, setMode] = useState<number>(Mode.Regular);
  const [hyper, setHyper] = useState<boolean>(false);
  const [dodge, setDodge] = useState<boolean>(false);
  const [character, setCharacter] = useState<number>(0);
  const [paddle, setPaddle] = useState<number>(Paddles.AverageJoe);
  const navigate = useNavigate();

  const [message, setMessage] = useState<string>("Pending...");

  useEffect(() => {
    function handleAccepted() {
      setMessage("Challenge accepted");
      navigate("/game");
      onClose();
    }

    function handleDeclined() {
      setMessage("Challenge declined");
    }

    function handleUnavailable(data: { username: string }) {
      const msg = data.username + " is currently unavailable.";
      setMessage(msg);
    }

    function handleUnavailableUser() {
      setMessage(
        "You're unable to send a challenge (you're probably still in a game)"
      );
    }

    function handleJoinGame() {
      socket.emit("joinChallengeGame", {
        userID: userID,
        targetID: targetID,
        mode: mode,
        hyper: hyper,
        dodge: dodge,
        character: character,
        paddle: paddle,
      });
    }
    socket.on("targetUnavailable", handleUnavailable);
    socket.on("userUnavailable", handleUnavailableUser);
    socket.on("pleaseJoinGame", handleJoinGame);
    socket.on("challengeAccepted", handleAccepted);
    socket.on("challengeDeclined", handleDeclined);
    return () => {
      socket.off("targetUnavailable", handleUnavailable);
      socket.off("userUnavailable", handleUnavailableUser);
      socket.off("challengeAccepted", handleAccepted);
      socket.off("challengeDeclined", handleDeclined);
      socket.off("pleaseJoinGame", handleJoinGame);
    };
  }, [
    socket,
    character,
    dodge,
    hyper,
    mode,
    navigate,
    paddle,
    targetID,
    userID,
    onClose,
  ]);
  const handleModeSelectionChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedValue = event.target.value;
    setMode(+selectedValue);
    if (+selectedValue === Mode.MasterOfPong) setMasterToggle(true);
    else setMasterToggle(false);
  };

  const handleHyperSelectionChange = (
    event: React.MouseEvent<HTMLInputElement>
  ) => {
    setHyper(!hyper);
  };

  const handleDodgeSelectionChange = (
    event: React.MouseEvent<HTMLInputElement>
  ) => {
    setDodge(!dodge);
  };

  const handleCharacterSelectionChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedValue = event.target.value;
    setCharacter(+selectedValue);
  };

  const handlePaddleSelectionChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedValue = event.target.value;
    setPaddle(+selectedValue);
  };

  function handleSendChallenge() {
    setChallengeSent(true);
    socket.emit("sendChallenge", {
      userID: userID,
      targetID: targetID,
      mode: mode,
      hyper: hyper,
      dodge: dodge,
      character: character,
      paddle: paddle,
    });
  }

  return (
    <>
      <div>
        <h3 className="PopHeader">Challenge</h3>
        <div className="PopBody">
          {challengeSent ? (
            <div>
              {message}
              <div className="button-container">
                <button className="cancel-button" onClick={onClose}>
                  Close
                </button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="gamemode">Choose a gamemode:</label>
              </div>
              <div>
                <select
                  name="gamemode"
                  id="gamemode"
                  onChange={handleModeSelectionChange}
                >
                  <option value={Mode.Regular}>Regular</option>
                  <option value={Mode.MasterOfPong}>Master of Pong</option>
                </select>
              </div>
              <div>Choose options:</div>
              <div>
                <input
                  type="checkbox"
                  id="hyper"
                  onClick={handleHyperSelectionChange}
                ></input>
                <label style={{ marginRight: "10px" }} htmlFor="hyper">
                  {" "}
                  Hyper Mode
                </label>
                <input
                  type="checkbox"
                  id="dodge"
                  onClick={handleDodgeSelectionChange}
                ></input>
                <label htmlFor="dodge"> Dodgeball</label>
              </div>

              {masterToggle ? (
                <>
                  <div>
                    <label htmlFor="character">Choose a character:</label>
                  </div>
                  <div>
                    <select
                      name="character"
                      id="character"
                      onChange={handleCharacterSelectionChange}
                    >
                      <option value={0}>Random</option>
                      <option value={Character.Venomtail}>Venomtail</option>
                      <option value={Character.BelowZero}>BelowZero</option>
                      <option value={Character.Raiven}>Raiven</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="size">Select a size:</label>
                  </div>
                  <div>
                    <select
                      name="size"
                      id="size"
                      onChange={handlePaddleSelectionChange}
                    >
                      <option value={Paddles.AverageJoe}>Regular</option>
                      <option value={Paddles.Small}>Small</option>
                      <option value={Paddles.BigPete}>Large</option>
                    </select>
                  </div>
                </>
              ) : null}

              <div className="button-container">
                <button className="create-button" onClick={handleSendChallenge}>
                  Challenge
                </button>
                <button className="cancel-button" onClick={onClose}>
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ChallengeRoomPopup;
