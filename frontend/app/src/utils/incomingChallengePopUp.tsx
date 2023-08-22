import React, { useEffect, useState } from 'react';
import '../components/ChatPage/PopUp.css'
import { Socket } from 'socket.io-client';
import { Character } from '../components/GameCanvas/enums/Characters';
import { Mode } from '../components/GameCanvas/enums/Modes';
import { Paddles } from '../components/GameCanvas/enums/Paddles';

interface ChallengeDetails {
  mode: number;
  hyper:boolean
  dodge: boolean;
  character: number;
  paddle: number;
}

type IncomingChallengePopUpProps = {
  isOpen: boolean;
  onClose: () => void;
  userID: string;
  challengerID: string;
  challengeDetais:ChallengeDetails
  socket: Socket;
};

const IncomingChallengePopUp: React.FC<IncomingChallengePopUpProps> = ({ socket, userID, challengerID, onClose, challengeDetais }) => {
  
	let gameInfo: string = "";
	let declineTimer: NodeJS.Timeout | null = null;

	switch (challengeDetais.mode) {
		case Mode.Regular:
			gameInfo = "Regular Match";
			break;
		case Mode.MasterOfPong:
			gameInfo = "Master of Pong";
			break;
	}
	if (challengeDetais.dodge && challengeDetais.hyper) {
		gameInfo = gameInfo + ", HyperDodge Mode";
	} else if (challengeDetais.dodge) {
		gameInfo = gameInfo + ", Dodge Mode";
	} else if (challengeDetais.hyper) {
		gameInfo = gameInfo + ", Hyper Mode";
	}

	declineTimer = setTimeout(() => {
    declineTimer = null;
		handleDecline();
	}, 20000);

  function handleAccept() {
    if (declineTimer) {
		  clearTimeout(declineTimer);
		  declineTimer = null;
	  }
  }

  function handleDecline() {
    if (declineTimer) {
      clearTimeout(declineTimer);
      declineTimer = null;
    }
    // emit decline message
    onClose();
  }

  return (
    <>
	<div>
		<h3 className="PopHeader">
			INCOMING Challenge, GET READY TO RUMBLE
		</h3>
    <div className="PopBody">
        <div>{gameInfo}</div>
        <div>
          mode = {challengeDetais.mode}
        </div>
        <div>
          character = {challengeDetais.character}
        </div>
        <div>
          paddle = {challengeDetais.paddle}
        </div>
      </div>
      <div className="button-container">
        <button className="create-button">
          Accept
        </button>
				<button className="cancel-button" onClick={onClose}>
					Decline
				</button>
			</div>
  </div>
    </>
  );
};

export default IncomingChallengePopUp;