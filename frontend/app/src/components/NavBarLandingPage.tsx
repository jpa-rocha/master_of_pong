import { AppBar, Toolbar, Box, Grid, Button } from '@mui/material';
import logo from "../images/logo.png";
import { useNavigate} from 'react-router-dom';


/* This is the Navigation Section for the Landing Page */
const NavBarLandingPage = () => {


	const navigate = useNavigate();

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		// navigate('/main');

		/*  TODO: instead of navigate('/main), we need 42 API : */

		/* const apiURL = `https://api.intra.42.fr/oauth/authorize?client_id=${clientID}&redirect_uri=${redirectURI}&response_type=code`;
		window.location.href = apiURL; 
		
		*/
		// API call and authorization, whats the next step,
		// it should redirect to MainPage but should the user name be gotten there?
		// Or should it redirect to an intermediary page? that just stores the user in the db?
		const apiURL = "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-21777d9ab5dd446dbc857420566faa413fd62652c1e6699de8ad7a306587ba4d&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fmain&response_type=code"
	
		window.location.href = apiURL; 
	};

	function handleClick(e: React.FormEvent) {
		e.preventDefault();
		navigate('/login');
		fetch('https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-f7533cf5641bff101ac46424a047de56d709a80023ae55feb7ee7ed17a11b741&redirect_uri=http%3A%2F%2F127.0.0.1%3A3000&response_type=code', {
		headers: {
			'Access-Control-Allow-Origin': 'https://api.intra.42.fr/oauth/authorize'
			// Add other headers if needed
		}
		})
		.then(response => response.json())
		.then(data => {
			console.log(data);
			// Use the data returned from the API call
		})
		.catch(error => {
			console.error('Error fetching data:', error);
		});

	  };

	  function handleClick2(e: React.FormEvent) {
		e.preventDefault();
		navigate('/home');
	  }; 
	
	
  return (
	
		<Box> 
			<AppBar position="fixed" style={{ backgroundColor: "#09090C", height:'6vh', minHeight: "70px" }}>
				<Toolbar>
					<Grid container justifyContent="center" alignItems="center">
						
						<Grid item xs={3} textAlign="left">
							<Button variant="contained" onClick={handleClick2}
								sx={{ background: 'linear-gradient(to right, #EA4224 0%, #EDC24F 50%, #EA4224 100%)', color: '#000000'}}>
								Main
							</Button>
						</Grid>
						<Grid item xs={6} textAlign="center">
							<Box  component="img" alt="Logo" src={logo} sx={{height: 70}}></Box>
						</Grid>
						<Grid item xs={3} textAlign="right">
						{/* <Link to="/login">  */}
							<Button variant="contained"  onClick={handleSubmit}/* component={Link}  to="/login" */
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