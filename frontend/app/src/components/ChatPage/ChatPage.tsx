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

const imgStyle = {
  background: 'linear-gradient(to right, #EA4224 0%, #c49b2b 50%, #EA4224 100%)',
};

const ChatPage: React.FunctionComponent<ChatPageProps> = ({ socket }) => {

  (async () => {
    const userID = await getUserID(getToken("jwtToken"));
    socket.emit("activityStatus", { userID: userID, status: "online" });
  })();

  return (
    <>
 <Grid container className="flex h-[100vh]" style={imgStyle}>
        {/* <div className="flex flex-col justify-center items-center h-[100vh]" style={imgStyle} /> */}

    <Grid item xs={12}> 
		  <NavBarMainPage></NavBarMainPage>
   	</Grid>
	   <Grid item xs={12} >
		    <div className="flex flex-col md:h-[80vh] text-gray-800 px-[2rem] py-[4rem] md:flex-row">
          <ChatBar socket={socket}></ChatBar>
          <div className="flex flex-col flex-auto px-6">
              <div className="flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-yellow-50 h-full p-4">
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
