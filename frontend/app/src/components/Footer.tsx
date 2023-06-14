import React from 'react'
import { AppBar, Toolbar, Grid, Box} from '@mui/material';


/* This is Footer */

const Footer = () => {
  return (
	<Box > 
	<AppBar position="fixed"
	style={{ backgroundColor: "#09090C",  height:'6vh', minHeight: "50px", zIndex: '0', fontSize: '30px' }}
	sx={{ top: "auto", bottom: 0 }}>
	<Toolbar>
		<Grid container spacing={12} justifyContent="center" alignItems="center">
			<Grid item md={12} textAlign="center">
			<p>Team Master of Pong</p>
			</Grid>
		</Grid>
	</Toolbar>
</AppBar>
</Box>
  )
}

export default Footer;