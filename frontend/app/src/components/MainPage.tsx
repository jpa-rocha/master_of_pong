import React from "react";
import "../styles/App.css";
import {Grid, Box} from "@mui/material";
import calm from "../images/CalmScorpion.gif";
import NavBarMainPage from "./NavBarMainPage";
import Footer from "./Footer";


/* This is the Main Page after User Login */

const MainPage: React.FunctionComponent = () => {
  return (
	<Box sx={{ display: 'flex', flexDirection: 'column',  alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
	<Grid container>

		{/* This is navigation */}
		<Grid item xs={12} >
				<NavBarMainPage></NavBarMainPage>
		</Grid>


		{/* This is main */}
		<Grid item xs={12} >
			<Box sx={{ flexGrow: 1, background: 'linear-gradient(to right, #EA4224 0%, #EDC24F 50%, #EA4224 100%)' }}>
				<Box display="flex" justifyContent="center" alignItems="center" sx={{height:"100vh"}}>
					<img src={calm} alt="calmScorpion" style={{ objectFit:"cover", width:"100%", height:"100%", opacity:"0.4"}}></img>
				</Box>
			</Box>	
		</Grid>


		{/* This is footer */}
		<Grid item xs={12}>
				<Footer></Footer>
		</Grid>

	</Grid>
	</Box>
  );
}

export default MainPage;