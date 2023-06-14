import React, {useState} from "react";
import { Button } from "@mui/material";

export default function MessageInput( {send}: { send: (val: string) => void } ) {
	const [value, setValue] = useState("")
	const [username, setUsername] = useState("Anonymous")

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			send(username + " : " + value);
			setValue('');
		}
	};
	return <>
		<input
			onChange={(e)=>setUsername(e.target.value)}
			placeholder="Type your username ..."
			value={username}
			style={{ textAlign: 'center', marginLeft: '10px', background: 'rgba(255, 255, 255, 0)', border: '2px solid #000000', borderRadius: '10px', color: '#000000', maxHeight: '40px', minHeight: '40px', fontSize: '30px' }}
		/>
		<input
			onChange={(e)=>setValue(e.target.value)}
			placeholder="Type your message ..."
			value={value}
			onKeyPress={handleKeyPress}
			style={{ flex: '1', marginRight: '10px', marginLeft: '10px', background: 'rgba(255, 255, 255, 0)', border: '2px solid #000000', borderRadius: '10px', color: '#000000', maxHeight: '40px', minHeight: '40px', fontSize: '30px' }}
		/>
		<Button onClick={() => send(username + " : " + value)} variant="contained" sx={{ background: 'linear-gradient(to right, #EA4224 0%, #EDC24F 50%, #EA4224 100%)', color: '#000000', marginRight: '10px', fontSize: '20px'}}>
			Send
		</Button>


	</>
}