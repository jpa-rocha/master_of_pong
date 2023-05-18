import { AppBar, Toolbar, Box, Grid, Button } from '@mui/material';
import logo from "../images/logo.png";
import Login from "./Login";
import { Link, Routes, Route} from "react-router-dom";


/* This is the Navigation Section for the Landing Page */
const NavBarLandingPage = () => {

	
  return (
	
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
						<Grid item xs={3} textAlign="right">
					{/* 	<Link to="/login">  */}
							<Button variant="contained" component={Link}  to="/login" 
								sx={{background: 'linear-gradient(to right, #EA4224 0%, #EDC24F 50%, #EA4224 100%)', color: '#000000'}}>
									Login
							</Button>
						{/* 	 </Link>  */}
						</Grid>
					</Grid>
				</Toolbar>
			</AppBar>

			
			<Routes>
				<Route path="/login" element={<Login/>}  />
			</Routes>
		</Box> 
  )
}

export default NavBarLandingPage;