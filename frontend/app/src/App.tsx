import React from "react";
import "./styles/App.css";
import { Link } from "react-router-dom";
import {Grid, Box, Button} from "@mui/material";
import { Toolbar, AppBar } from "@mui/material";
import logo from "../src/images/logo.png";
import calm from "../src/images/CalmScorpion.gif";


const App: React.FunctionComponent = () => {
	

	return (
		
		<Box sx={{ display: 'flex', flexDirection: 'column',  alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
			<Grid container>


				{/* This is navigation */}
				<Grid item xs={12} >
					<Box> 
						<AppBar position="fixed" style={{ backgroundColor: "#09090C", height:'6vh', minHeight: "70px" }}>
							<Toolbar>
								<Grid container justifyContent="center" alignItems="center">
									
									<Grid item xs={3} textAlign="left">
										<Button variant="contained" 
											sx={{ background: 'linear-gradient(to right, #EA4224 0%, #EDC24F 50%, #EA4224 100%)', color: '#000000'}}>
											Main
										</Button>
									</Grid>

									<Grid item xs={6} textAlign="center">
										<Box  component="img" alt="Logo" src={logo} sx={{height: 70}}></Box>
									</Grid>

									{/* <Grid item xs={3}textAlign="left">
										<h2>Master of Pong</h2>
									</Grid> */}

									<Grid item xs={3} textAlign="right">
										<Button variant="contained" component={Link} to='../src/pages/Login.tsx' target="_blank"
											sx={{background: 'linear-gradient(to right, #EA4224 0%, #EDC24F 50%, #EA4224 100%)', color: '#000000'}}>
											Login
										</Button>
									</Grid>
								</Grid>
							</Toolbar>
						</AppBar>
					</Box> 
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
					<Box > 
						<AppBar position="fixed"
							style={{ backgroundColor: "#09090C",  height:'6vh', minHeight: "50px" }}
							sx={{ top: "auto", bottom: 0 }}>
							<Toolbar>
								<Grid container spacing={12} justifyContent="center" alignItems="center">
									<Grid item md={12} textAlign="center">
									<p>Footer</p>
									</Grid>
								</Grid>
							</Toolbar>
						</AppBar>
					</Box> 
				</Grid>

				
			</Grid>
		</Box>
	);
};

export default App;
