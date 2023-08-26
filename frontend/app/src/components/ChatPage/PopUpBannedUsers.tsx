import React from "react";
import "./PopUp.css";
import { Socket } from "socket.io-client";
import { Chat } from "./PropUtils";

type BannedUsersPopUpProps = {
  isOpen: boolean;
  onClose: () => void;
  socket: Socket;
  chat: Chat;
};

const BannedUsersPopUp: React.FC<BannedUsersPopUpProps> = ({
  isOpen,
  onClose,
  socket,
  chat,
}) => {
  const handleUnBan = (targetID: string) => {
    socket.emit("unbanUser", { userID: targetID, chatID: chat.id });
  };

  return (
    <div className="bannedDiv">
      <h3 className="PopHeader banned">Banned Users</h3>

      <div className="PopBody">
        {chat.banned &&
          chat.banned.map((user) => (
            <div key={user.id}>
              {user.username}
              <button
                onClick={() => handleUnBan(user.id)}
                className="relative ml-3 text-sm bg-indigo-100 py-2 px-4 shadow rounded-xl"
              >
                unban
              </button>
            </div>
          ))}
      </div>

      <div className="button-container">
        <button className="cancel-button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default BannedUsersPopUp;
