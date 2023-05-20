import React from 'react';
import { AppBar, Toolbar, Typography, Box, Avatar, Stack } from '@mui/material';
import logo from "../images/logo.png";


/* This is the Navigation Section for the Main Page */
const NavBarMainPage = () => {

	const getName = (value: String) => {
		return `${value.split(" ")[0][0]}${value.split(" ")[1][0]}`
	}

  return (
	<Box>
    <AppBar position="fixed" style={{ backgroundColor: "#09090C", height:'6vh', minHeight: "70px" }} >
      <Toolbar>
	  	<Typography variant="h6" sx={{cursor: 'pointer'}}>
            Home 
        </Typography>

		<div  style={{ flexGrow: 1, textAlign: 'center' }}>
			<Box component="img" alt="Logo" src={logo} sx={{height: 70}}></Box>
        </div>

		<Stack direction="row" spacing={3}>
        	<Typography variant="h6">
            	Play
        	</Typography>
          	<Typography variant="h6">
            	Chat
          	</Typography>
          	<Typography variant="h6">
            	Logout
          	</Typography>
		  	<Avatar 
				sx={{ bgcolor: '#fff', color: '#000', cursor: 'pointer' }}
				children={getName("User Name")} />
		</Stack>

      </Toolbar>
    </AppBar>
	</Box>
  );
}

export default NavBarMainPage;