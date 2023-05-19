import React from "react";
import "../styles/App.css";
import { Grid, Box } from "@mui/material";
import calm from "../images/CalmScorpion.gif"
import Footer from "./Footer";
import NavBarLandingPage from "./NavBarLandingPage";
import Login from "./Login";
import { Routes, Route } from "react-router-dom";

/* This is the Landing Page */

const App: React.FunctionComponent = () => {


	return (
		
		<Box sx={{ display: 'flex', flexDirection: 'column',  alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
			<Grid container>


				{/* This is navigation */}
				<Grid item xs={12} >
					<NavBarLandingPage></NavBarLandingPage>
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


			<Routes>
				<Route path="/login" element={<Login/>}  />
			</Routes>
		</Box>
	);
};

export default App;
