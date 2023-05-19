import { AppBar, Toolbar, Box, Grid, Button } from '@mui/material';
import logo from "../images/logo.png";
import { useNavigate} from 'react-router-dom';
/* import { useEffect, useState } from 'react'; */

/* This is the Navigation Section for the Landing Page */
const NavBarLandingPage = () => {

	/* const [bgColor, setBgColor] = useState<string>('#ffc800');

	useEffect( () => {
		document.body.style.background = bgColor;
	}, [bgColor]);

	const changeColor = (bgColor:string) =>{
		setBgColor(bgColor);
	  };

 */
	const navigate = useNavigate();

	function handleClick(e: React.FormEvent) {
		e.preventDefault();
		navigate('/login');
	  }; 

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
						{/* <Link to="/login">  */}
							<Button variant="contained"  onClick={handleClick}/* component={Link}  to="/login" */
								sx={{background: 'linear-gradient(to right, #EA4224 0%, #EDC24F 50%, #EA4224 100%)', color: '#000000'}}>
								Login
							</Button>
							{/*  </Link>  */}
						</Grid>
					</Grid>
				</Toolbar>
			</AppBar>

		</Box> 
  )
}

export default NavBarLandingPage;