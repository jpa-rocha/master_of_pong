import React, { useEffect } from "react";
import "../components/ChatPage/PopUp.css";
import { Socket } from "socket.io-client";
import { Character } from "../components/GameCanvas/enums/Characters";
import { Mode } from "../components/GameCanvas/enums/Modes";
import { Paddles } from "../components/GameCanvas/enums/Paddles";
import { useNavigate } from "react-router-dom";

interface ChallengeDetails {
  mode: number;
  hyper: boolean;
  dodge: boolean;
  character: number;
  paddle: number;
  challengerID: string;
  userID: string;
  challengerUsername: string;
}

type IncomingChallengePopUpProps = {
  isOpen: boolean;
  onClose: () => void;
  challengeDetais: ChallengeDetails;
  socket: Socket;
};

const IncomingChallengePopUp: React.FC<IncomingChallengePopUpProps> = ({
  socket,
  onClose,
  challengeDetais,
}) => {
  const navigate = useNavigate();
  let masterToggle = false;
  let character = 0;
  let paddle = Paddles.AverageJoe;

  if (challengeDetais.mode === Mode.MasterOfPong) masterToggle = true;
  let gameMode: string = "";
  let gameOptions: string = "";
  let declineTimer: NodeJS.Timeout | null = null;

  switch (challengeDetais.mode) {
    case Mode.Regular:
      gameMode = "Regular Match";
      break;
    case Mode.MasterOfPong:
      gameMode = "Master of Pong";
      break;
  }
  if (challengeDetais.dodge && challengeDetais.hyper) {
    gameOptions = "HyperDodgeball";
  } else if (challengeDetais.dodge) {
    gameOptions = "Dodgeball";
  } else if (challengeDetais.hyper) {
    gameOptions = " Hyper";
  } else {
    gameOptions = "Default";
  }

  declineTimer = setTimeout(() => {
    declineTimer = null;
    handleDecline();
  }, 200000000);
  // }, 20000);

  function handleAccept() {
    if (declineTimer) {
      clearTimeout(declineTimer);
      declineTimer = null;
    }
    socket.emit("acceptChallenge", {
      userID: challengeDetais.userID,
      challengerID: challengeDetais.challengerID,
      mode: challengeDetais.mode,
      hyper: challengeDetais.hyper,
      dodge: challengeDetais.dodge,
      challengerCharacter: challengeDetais.character,
      userCharacter: character,
      challengerPaddle: challengeDetais.paddle,
      userPaddle: paddle,
    });
  }

  function handleDecline() {
    if (declineTimer) {
      clearTimeout(declineTimer);
      declineTimer = null;
    }
    socket.emit("declineChallenge", {
      userID: challengeDetais.userID,
      challengerID: challengeDetais.challengerID,
    });
    // emit decline message
    onClose();
  }

  useEffect(() => {
    function handleAccepted() {
      navigate("/game");
    }
    socket.on("challengeAccepted", handleAccepted);
    return () => {
      socket.off("challengeAccepted", handleAccepted);
    };
  }, [socket, navigate]);

  const handleCharacterSelectionChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedValue = event.target.value;
    character = +selectedValue;
  };

  const handlePaddleSelectionChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedValue = event.target.value;
    paddle = +selectedValue;
  };

  return (
    <>
      <div>
        <h3 className="PopHeader">
          Incoming challenge from {challengeDetais.challengerUsername}
        </h3>
        <div className="PopBody">
          <div>Mode: {gameMode}</div>
          <div>Options: {gameOptions}</div>
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
            <button className="create-button" onClick={handleAccept}>
              Accept
            </button>
            <button className="cancel-button" onClick={handleDecline}>
              Decline
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default IncomingChallengePopUp;
