import React, { useEffect, useState } from 'react';
import './PopUp.css'
import { Socket } from 'socket.io-client';

type JoinChatRoomPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  onJoinChatRoom: (chatRoomName: string, chatRoomPassword: string) => void;
  socket: Socket;
};

interface ChatRoomProps {
  id: number;
  title: string;
  channel: string;
  password: string;
}

const JoinChatRoomPopup: React.FC<JoinChatRoomPopupProps> = ({ isOpen, onClose, onJoinChatRoom, socket }) => {
  const [chatRoomName, setChatRoomName] = useState('');
  const [chatRoomPassword, setChatRoomPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [chatRooms, setChatRooms] = useState<ChatRoomProps[]>([]);

  socket.on("joinableRooms", (data: ChatRoomProps[]) => {
      setChatRooms(data);
      console.log("AVAILABLE CHAT ROOMS: ", chatRooms);
  });

  const handleJoinChatRoom = (chatName: string) => {
    setChatRoomName(chatName);
    console.log("TITLE ===== ", chatName);
    onJoinChatRoom(chatName, chatRoomPassword);
    onClose();
  };

  useEffect(() => {
    if (chatRoomName !== '') {
      socket.emit('getChatRooms', {name: chatRoomName});
    } else {
      setChatRooms([]);
    }
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
            <input type="text" placeholder="Chat Room Name" value={chatRoomName} onChange={(e) => setChatRoomName(e.target.value)} />
          </div>
          {chatRooms && chatRooms.map((room) => (
            <div key={room.id}>
              {room.title} {room.channel}
              {room.channel === 'private' ? (
                <input type="text" placeholder="Password" value={chatRoomPassword} onChange={(e) => setChatRoomPassword(e.target.value)} />
              ): null}
              <button className='join-button' onClick={() => handleJoinChatRoom(room.title)}>Join</button>
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