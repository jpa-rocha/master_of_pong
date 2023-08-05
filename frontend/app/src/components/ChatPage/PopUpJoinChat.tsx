import React, { useEffect, useState } from 'react';
import './PopUp.css'
import { Socket } from 'socket.io-client';
import { Message, User, Chat } from "./PropUtils";

type JoinChatRoomPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  onJoinChatRoom: (chatRoomName: string, chatRoomPassword: string) => void;
  socket: Socket;
};

interface PasswordInputProp {
  chatID: number;
  password: string;
}

const JoinChatRoomPopup: React.FC<JoinChatRoomPopupProps> = ({ isOpen, onClose, onJoinChatRoom, socket }) => {
  const [chatRoomName, setChatRoomName] = useState('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [chatRooms, setChatRooms] = useState<Chat[]>([]);
  const [passwordInput, setPasswordInput] = useState<PasswordInputProp[]>([]);
  
  const checkPassword = (id: number, password: string) => {
    return new Promise((resolve, reject) => {
      socket.emit('checkChatRoomPassword', {id: id, password: password}, (result: boolean) => {
        resolve(result);
      });
    });
  };

  const  handleJoinChatRoom = async (chatName: string, chatID: number) => {
    setChatRoomName(chatName);
    const foundPasswordInput = passwordInput.find((item) => item.chatID === chatID);
    const passwordToSend = foundPasswordInput ? foundPasswordInput.password : "";

    const checkResult = await checkPassword(chatID, passwordToSend);
    if (!checkResult)
    {
      setPasswordError("Wrong password, please try again");
      return;
    }
    onJoinChatRoom(chatName, passwordToSend);
    onClose();
  };

  const setPasswordInputs = (password: string, chatID: number) => {
    setPasswordError("");
    const index = passwordInput.findIndex((chat) => chat.chatID === chatID);
    if (index === -1) {
      setPasswordInput([...passwordInput, {chatID, password}])
    } else {
      const tempPasswords = [...passwordInput];
      tempPasswords[index].password = password;
      setPasswordInput(tempPasswords);
    }
  }

  useEffect(() => {
    if (chatRoomName !== '') {
      socket.emit('getChatRooms', {name: chatRoomName});
    } else {
      setChatRooms([]);
    }

    const handleJoinableRooms = (data: Chat[]) => {
      setChatRooms(data);
    }
    socket.on("joinableRooms", handleJoinableRooms);
    return () => {
      socket.off("joinableRooms", handleJoinableRooms);
    };
	}, [chatRoomName, socket]);

  if (!isOpen) return null;

  return (
    <>
      <div>
        <h3 className="PopHeader">
          Join Chat Room
        </h3>
        <div className="PopBody">
          <div className="name-input">
            <input type="text" placeholder="Chat Room Name" value={chatRoomName} onChange={(e) => {setChatRoomName(e.target.value); setPasswordError("")}} />
          </div>
          {chatRooms && chatRooms.map((room) => (
            <div className='joinable-chat' key={room.id}>
              <div className='room'>
                <div className='room-title'>{room.title}</div>
                {room.channel}
              </div>
              {room.channel === 'private' ? (
                <div>
                  <input type="password" placeholder="Password" onChange={(e) => setPasswordInputs(e.target.value, room.id)} />
                  <div className="error-message">{passwordError}</div> 
                </div>
              ) : null}
              <button className='join-button' onClick={() => handleJoinChatRoom(room.title, room.id)}>Join</button>
            </div>
          ))}

          {/* Button Part : Create, Cancel */}
          <div className="button-container">
            <button className="cancel-button" onClick={onClose}>
              Cancel
            </button>
				</div>
        </div>
      </div>
    </>
  );
};

export default JoinChatRoomPopup;