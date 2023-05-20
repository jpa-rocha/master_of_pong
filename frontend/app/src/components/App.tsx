import React from "react";
import "../styles/App.css";
import { Box } from "@mui/material";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import LandingPage from "./LandingPage";

const theme = createTheme({
	palette: {
	  primary: {
		main: '#B70404', // Modify this color as per your requirement
	  },
	},
	typography: {
		fontFamily: 'Neucha', 
	}
  });
  

/* This is the Landing Page */

const App: React.FunctionComponent = () => {


	return (
	
		<ThemeProvider theme={theme}>
		<Box sx={{ display: 'flex', flexDirection: 'column',  alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
			<LandingPage></LandingPage>
		</Box>
		</ThemeProvider>	
	);
};

export default App;
