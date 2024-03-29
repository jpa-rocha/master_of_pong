import React, { useEffect, useState } from "react";
import "./PopUp.css";
import { Socket } from "socket.io-client";

type PopUpCreateChatProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreateChatRoom: (chatRoomName: string, chatRoomPassword: string) => void;
  socket: Socket;
};

const PopUpCreateChat: React.FC<PopUpCreateChatProps> = ({
  isOpen,
  onClose,
  onCreateChatRoom,
  socket,
}) => {
  const [chatRoomName, setChatRoomName] = useState("");
  const [chatRoomPassword, setChatRoomPassword] = useState("");
  const [nameError, setNameError] = useState<string>("");

  const handleCreateChatRoom = async () => {
    if (chatRoomName === "" || nameError) return;
    onCreateChatRoom(chatRoomName, chatRoomPassword);
    onClose();
  };

  useEffect(() => {
    const checkChatTitle = (name: string) => {
      return new Promise((resolve, reject) => {
        socket.emit("checkChatRoomName", { name }, (result: boolean) => {
          resolve(result);
        });
      });
    };

    const getAvailability = async () => {
      const availability = await checkChatTitle(chatRoomName);
      if (!availability) setNameError("* This chat room name is already taken");
      else if (chatRoomName.length > 20)
        setNameError("* Name must be 20 characters or shorter");
      else if (chatRoomName.length <= 0)
        setNameError("* Please input a chat room name");
      else if (!/^[a-zA-Z0-9]+$/.test(chatRoomName)) {
        setNameError("* Chat Rooms name must be alphanumeric");
      } else setNameError("");
    };
    getAvailability();
  }, [chatRoomName, socket]);

  if (!isOpen) return null;

  return (
    <>
      <div>
        <h3 className="PopHeader">Create a chat room</h3>
        <div className="PopBody">
          {/* Input Part */}
          <div className="name-input">
            <input
              type="text"
              placeholder="Chat Room Name"
              maxLength={15}
              value={chatRoomName}
              onChange={(e) => setChatRoomName(e.target.value)}
            />
            <div className="error">{nameError}</div>
          </div>
          <div className="password-input">
            <input
              type="password"
              placeholder="Password"
              maxLength={50}
              value={chatRoomPassword}
              onChange={(e) => setChatRoomPassword(e.target.value)}
            />
          </div>
          <div>* private chat room - put in a Password</div>
          <div>* public chat room - leave Password blank</div>

          {/* Button Part : Create, Cancel */}
          <div className="button-container">
            <button className="create-button" onClick={handleCreateChatRoom}>
              Create
            </button>
            <button className="cancel-button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PopUpCreateChat;
