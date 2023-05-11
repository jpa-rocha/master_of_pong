import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import logo from "../images/logo.png";

/* This is the Navigation Section for the Main Page */
const NavBarMainPage = () => {

  return (
	<Box>
    <AppBar position="fixed" style={{ backgroundColor: "#09090C", height:'6vh', minHeight: "70px" }} >
      <Toolbar>
        <div  style={{ flexGrow: 1, textAlign: 'center' }}>
		<Box component="img" alt="Logo" src={logo} sx={{height: 70}}></Box>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <Typography variant="h6" style={{ display: 'inline-block', marginRight: 20, cursor: 'pointer'}}>
            Home 
          </Typography>
          <Typography variant="h6" style={{ display: 'inline-block', marginRight: 20, cursor: 'pointer' }}>
            Rules
          </Typography>
          <Typography variant="h6" style={{ display: 'inline-block', marginRight: 20, cursor: 'pointer' }}>
            Chat
          </Typography>
          <Typography variant="h6" style={{ display: 'inline-block', cursor: 'pointer'}}>
            Logout
          </Typography>
        </div>
      </Toolbar>
    </AppBar>
	</Box>
  );
}

export default NavBarMainPage;