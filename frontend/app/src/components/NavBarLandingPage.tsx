import { AppBar, Toolbar, Box, Grid, Button } from "@mui/material";
import logo from "../images/logo.png";
import { useNavigate } from "react-router-dom";

/* This is the Navigation Section for the Landing Page */
const NavBarLandingPage: React.FunctionComponent = () => {
  const navigate = useNavigate();

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    //navigate('/main');

    /*  TODO: instead of navigate('/main), we need 42 API : */

    /* API call and authorization, whats the next step,
		it should redirect to MainPage but should the user name be gotten there?

		This is the right option!
		--> Or should it redirect to an intermediary page? that just stores the user in the db? */

    const apiUrl = "http://localhost:5000/api/auth/redirect";
    if (!apiUrl) {
      console.error("REACT_APP_API_URL is not defined");
      return;
    }

    fetch(apiUrl, {
      // Add necessary headers for the API request
      mode: "cors",
      headers: {
        "Access-Control-Allow-Origin": "*",
        // 		// Add other headers if needed
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }

  // function handleLogin(e: React.FormEvent) {
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

  function handleReturnHome(e: React.FormEvent) {
    e.preventDefault();
    navigate("/home");
  }

  function handleGame(e: React.FormEvent) {
    e.preventDefault();
    navigate("/game");
  }
  function handleChat(e: React.FormEvent) {
    e.preventDefault();
    navigate("/chat");
  }

  return (
    <Box>
      <AppBar
        position="fixed"
        style={{ backgroundColor: "#09090C", height: "6vh", minHeight: "70px" }}
      >
        <Toolbar>
          <Grid container justifyContent="center" alignItems="center">
            <Grid item xs={3} textAlign="left">
              <Button
                variant="contained"
                onClick={handleReturnHome}
                sx={{
                  background:
                    "linear-gradient(to right, #EA4224 0%, #EDC24F 50%, #EA4224 100%)",
                  color: "#000000",
                  fontSize: "20px",
                }}
              >
                Main
              </Button>
            </Grid>
            <Grid item xs={6} textAlign="center">
              <Box
                component="img"
                alt="Logo"
                src={logo}
                sx={{ height: 70 }}
              ></Box>
            </Grid>
            <Grid item xs={3} textAlign="right">
              {/* <Link to="/login">  */}
              <a href="http://localhost:5000/api/auth/redirect" style={{textDecoration: "none"}}>
              <Button
                variant="contained"
                // onClick={handleLogin}
                sx={{
                  background:
                    "linear-gradient(to right, #EA4224 0%, #EDC24F 50%, #EA4224 100%)",
                  color: "#000000",
                  fontSize: "20px",
                }}
              >
                Login
              </Button>
              </a>
              <Button
                variant="contained"
                onClick={handleGame}
                sx={{
                  background:
                    "linear-gradient(to right, #EA4224 0%, #EDC24F 50%, #EA4224 100%)",
                  color: "#000000",
                  fontSize: "20px",
                }}
              >
                Game
              </Button>
              <Button
                variant="contained"
                onClick={handleChat}
                sx={{
                  background:
                    "linear-gradient(to right, #EA4224 0%, #EDC24F 50%, #EA4224 100%)",
                  color: "#000000",
                  fontSize: "20px",
                }}
              >
                Chat
              </Button>
              {/*  </Link>  */}
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default NavBarLandingPage;
