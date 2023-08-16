import React, { useEffect, useState } from 'react';
import { Box } from "@mui/material";
import MessageInput from './MessageInput';
import Messages from './Messages';
import io, { Socket } from "socket.io-client"

export default function Chat() {
	const [socket, setSocket] = useState<Socket>()
	const [messages, setMessages] = useState<string[]>([])

	const send = (value: string) => {
		socket?.emit("message", value)
	}

	useEffect(() => {
		const newSocket=io("http://localhost:8001")
		setSocket(newSocket)
	},[setSocket])
	
	const messageListener = (message: string) => {
		setMessages([...messages, message])
	}

	useEffect(() => {
		socket?.on("message", messageListener)
		return () => {
			socket?.off("message", messageListener)
		}
	},[messageListener])

	return (
	  <>
		<Box
			sx={{
				display: 'flex',
				position: 'absolute',
				top: '9%',
				background: 'rgba(255, 255, 255, 0)',
				overflowY: 'auto',
				overflowX: 'hidden',
				maxHeight: '78vh',
				maxWidth: '50vw',
				wordWrap: 'break-word',
			}}>
			<Messages messages={messages}/>
		</Box>
		<Box sx={{display: 'flex', zIndex:'1', position: 'absolute', top: '89%', background: 'rgba(255, 255, 255, 0)', width: '100%' }}>
			<MessageInput send={send}/>
		</Box>
	  </>
	);
  }