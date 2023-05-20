
import React from 'react';
import { Grid, Box } from "@mui/material";
import calm from "../images/CalmScorpion.gif"
import Footer from "./Footer";
import NavBarLandingPage from "./NavBarLandingPage";


const LandingPage = () => {
  return (
	<>
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
	</>
  )
}

export default LandingPage;