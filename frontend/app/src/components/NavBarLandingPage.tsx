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

		// window.location.href = process.env.REACT_APP_API_URL;
	};

	// function handleClick(e: React.FormEvent) {
	// 	e.preventDefault();
	// 	navigate('/login');
	// 	fetch(<process className="env REACT_APP_API_URL"></process>, {
	// 	headers: {
	// 		'Access-Control-Allow-Origin': 'https://api.intra.42.fr/oauth/authorize'
	// 		// Add other headers if needed
	// 	}
	// 	})
	// 	.then(response => response.json())
	// 	.then(data => {
	// 		console.log(data);
	// 		// Use the data returned from the API call
	// 	})
	// 	.catch(error => {
	// 		console.error('Error fetching data:', error);
	// 	});

	//   };

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
								sx={{ background: 'linear-gradient(to right, #EA4224 0%, #EDC24F 50%, #EA4224 100%)', color: '#000000', fontSize: '20px' }}>
								Main
							</Button>
						</Grid>
						<Grid item xs={6} textAlign="center">
							<Box  component="img" alt="Logo" src={logo} sx={{height: 70}}></Box>
						</Grid>
						<Grid item xs={3} textAlign="right">
						{/* <Link to="/login">  */}
							<Button variant="contained"  onClick={handleSubmit}
								sx={{background: 'linear-gradient(to right, #EA4224 0%, #EDC24F 50%, #EA4224 100%)', color: '#000000', fontSize: '20px' }}>
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
