import React, { useEffect, useState } from 'react';
import './PopUp.css'
import { Socket } from 'socket.io-client';
import { Message, User, Chat } from "./PropUtils";

type ChallengePopupProps = {
  isOpen: boolean;
  onClose: () => void;
  targetID: string;
  socket: Socket;
};

const ChallengeRoomPopup: React.FC<ChallengePopupProps> = ({ socket, targetID }) => {

  return (
    <>
		<div>Challenge PopUP</div>
    </>
  );
};

export default ChallengeRoomPopup;