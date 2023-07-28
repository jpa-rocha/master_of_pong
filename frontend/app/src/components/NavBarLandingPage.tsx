import { AppBar, Toolbar, Box, Grid, Button } from "@mui/material";
import logo from "../images/logo.png";

/* This is the Navigation Section for the Landing Page */
const NavBarLandingPage: React.FunctionComponent = () => {
  return (
    <Box style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center"}}>
      {/* <AppBar position="absolute" style={{ backgroundColor: "rgba(0, 0, 0, 0)", height: "100vh", minHeight: "100vh" }}>
        <Toolbar> */}
          <Grid container justifyContent="center" alignItems="center" direction="column">
            <Grid className="logo" item xs={12} textAlign="center">
              <Box
                component="img"
                alt="Logo"
                src={logo}
                sx={{ height: 200 }}
              />
            </Grid>
            <Grid className="log_button" item xs={12} textAlign="center">
              <a href="http://localhost:5000/api/auth/redirect" style={{ textDecoration: "none" }}>
                <Button
                  variant="contained"
                  // onClick={handleLogin}
                  sx={{
                    background: "linear-gradient(to right, #EA4224 0%, #EDC24F 50%, #EA4224 100%)",
                    color: "#000000",
                    fontSize: "20px",
                  }}
                >
                  Login
                </Button>
              </a>
            </Grid>
          </Grid>
        {/* </Toolbar>
      </AppBar> */}
    </Box>
  );
};

export default NavBarLandingPage;
