import React from "react";
import { Socket } from "socket.io-client";
import NavBarMainPage from "../Navigation/NavBarMainPage";
import Footer from "../Footer";
import ChatBar from "./ChatBar";
import ChatBody from "./ChatBody";
import ChatFooter from "./ChatFooter";
import { Grid } from "@mui/material";
import { getUserID, getToken } from "../../utils/Utils";
import ChatUsers from "./ChatUsers";


interface ChatPageProps {
  socket: Socket;
}

const ChatPage: React.FunctionComponent<ChatPageProps> = ({ socket }) => {

  (async () => {
    const userID = await getUserID(getToken("jwtToken"));
    socket.emit("activityStatus", { userID: userID, status: "online" });
  })();

  return (
    <>
 <Grid container>

     <Grid item xs={12}> 
		<NavBarMainPage></NavBarMainPage>
   	</Grid>

    <Grid item xs={12}> 
		<div className="flex flex-col md:flex-row h-screen text-gray-800 bg-gray-100  md:p-20 justify-between">
          	<ChatBar socket={socket}></ChatBar>
        	<div className="flex flex-col flex-auto px-6 ">
            	<div className="flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-200 p-4">
                	<ChatBody socket={socket}/> 
                	<ChatFooter socket={socket}/>
            	</div>
        	</div> 
        	<ChatUsers socket={socket}></ChatUsers>
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
