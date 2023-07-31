import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import NavBarMainPage from "../Navigation/NavBarMainPage";
import Footer from "../Footer";
import ChatBar from "./ChatBar";
import ChatBody from "./ChatBody";
import ChatFooter from "./ChatFooter";
import { Grid } from "@mui/material";
import { getUserID, getToken } from "../../utils/Utils";


interface ChatPageProps {
  socket: Socket;
}

interface UserProps {
  forty_two_id: number;
  username: string | undefined;
  refresh_token: string;
  email: string;
  avatar: string;
  is_2fa_enabled: boolean;
  xp: number;
  id: string;
}

interface MessageProps {
  id: number,
  sender: UserProps,
  content: string,
}

const ChatPage: React.FunctionComponent<ChatPageProps> = ({ socket }) => {
  const [messages, setMessages] = useState<any[]>([]);
  let userID: string = "";

  (async () => {
    userID = await getUserID(getToken("jwtToken"));
    console.log("UserID: " + userID);
    socket.emit("activityStatus", { userID: userID, status: "online" });
  })();

  useEffect(() => {
    // socket.on("message", (data: MessageProps[]) => setMessages(data));
  }, [socket, messages]);

  return (
    <>
    <Grid container>

    	<Grid item xs={12}>
    	  <NavBarMainPage></NavBarMainPage>
    	</Grid>

        <Grid item xs={12}>
		<div className="flex h-4/5 text-gray-800 ">
			<ChatBar socket={socket}></ChatBar>
			<div className="flex flex-col flex-auto h-full p-6">
          	<div className="flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-100 h-full p-4">
				<ChatBody socket={socket}/> 
				<ChatFooter socket={socket}/>
			</div>
        	</div>
		</div>
        </Grid>

        <Grid item xs={12}>
          <Footer></Footer>
        </Grid>
    </Grid>
    </>
  );
};

export default ChatPage;
