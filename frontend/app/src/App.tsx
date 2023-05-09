import React from "react";
import "./styles/App.css";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Grid from "@mui/material/Grid";
import { Toolbar, AppBar, TextField, createStyles } from "@mui/material";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import logo from "../src/images/logo.png"
import calm from "../src/images/CalmScorpion.gif"

/* import { createTheme, Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles'; */

/*const theme = createTheme({
  palette: {
    primary: {
      light: '#757ce8',
      main: '#3f50b5',
      dark: '#002884',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ff7961',
      main: '#f44336',
      dark: '#ba000d',
      contrastText: '#000',
    },
  },
}); */

/* const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		logo: {
			maxWidth: 40,
			marginRight: '10px'
		}
	})
); */


const App: React.FunctionComponent = () => {
	
  return (
	<Box sx={{ display: 'flex', flexDirection: 'column',  alignItems: 'center', justifyContent: 'center', height: '100vh',
		margin:0, padding:0}}
	>
	<Grid container>

{/* 	This is navigation */}
	  <Grid item xs={12} >
		 <Box > 
			<AppBar position="fixed"
 					style={{ backgroundColor: "#09090C", height:'6vh' }}>
  				<Toolbar>
					<Grid container justifyContent="center" alignItems="center">
					<Grid item xs={3} >
					
						 <Box  component="img" alt="Logo" src={logo} sx={{height: 57}}>
						 </Box>
						 
	  					</Grid>
	  					<Grid item xs={3} >
						  <Button variant="contained"
                				sx={{ background: 'linear-gradient(to right, #EA4224 0%, #EDC24F 50%, #EA4224 100%)',
                  						color: '#FFFFFF'}}>
							Main
              			</Button>
	  					</Grid>
	  				<Grid item xs={3} >
						<h2>Master of Pong</h2>
	  				</Grid>
	  				<Grid item xs={3} >
					  	<Button variant="contained"
                		sx={{background: 'linear-gradient(to right, #EA4224 0%, #EDC24F 50%, #EA4224 100%)',
                  			color: '#FFFFFF'}}>
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
		<Box sx={{
        flexGrow: 1,  height: "100vh", width: "100vw", margin:0, padding:0,
        background: 'linear-gradient(to right, #EA4224 0%, #EDC24F 50%, #EA4224 100%)'
      }}
	  >
		<Box display="flex" justifyContent="center" alignItems="center"
			sx={{height:"100vh"}}>
        		<img src={calm} alt="calmScorpion" 
				style={{ objectFit:"cover", width:"100%", height:"100%", opacity:"0.4"}}></img>
		</Box>

		</Box>
	  </Grid>




{/* This is footer */}
	  <Grid item xs={12}>
	<Box > 
			<AppBar position="fixed"
  				style={{ backgroundColor: "#09090C",  height:'6vh'}}
  				sx={{ top: "auto", bottom: 0 }}>
  				<Toolbar>
					<Grid container spacing={12} justifyContent="center" alignItems="center">
	  					<Grid item md={12}>
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



{/* <Container
sx={{ backgroundColor: "grey.A700", height: "100vh", width: "100vw" }}
>
<AppBar
  position="fixed"
  style={{ backgroundColor: "#09090C", height: "10vh" }}
>
  <Toolbar>
	<Grid container justifyContent="center" alignItems="center">
	  <Grid item xs={12} sm={4} md={4}>
		<Button variant="contained">Main</Button>
	  </Grid>
	  <Grid item xs={12} sm={4} md={4}>
		<h2>Master of Pong</h2>
	  </Grid>
	  <Grid item xs={12} sm={4} md={4}>
		<Button variant="contained"> Login </Button>
	  </Grid>
	</Grid>
  </Toolbar>
</AppBar>

<Box sx={{ flexGrow: 1, backgroundColor: "#3f50b5", height: "80vh" }}>

  <p>hello</p>

</Box>

<AppBar
  position="fixed"
  style={{ backgroundColor: "#09090C", height: "10vh" }}
  sx={{ top: "auto", bottom: 0 }}
>
  <Toolbar>
	<Grid
	  container
	  spacing={12}
	  justifyContent="center"
	  alignItems="center"
	>
	  <Grid item md={12}>
		<p>Footer</p>
	  </Grid>
	</Grid>
  </Toolbar>
</AppBar>

</Container>
); */}