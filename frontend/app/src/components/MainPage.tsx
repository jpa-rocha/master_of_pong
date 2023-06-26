import React from "react";
import "../styles/App.css";
import {Grid, Box} from "@mui/material";
import angry from "../images/AngryScorpion.gif";
import NavBarMainPage from "./NavBarMainPage";
import Footer from "./Footer";


/* This is the Main Page after User Login */

const MainPage: React.FunctionComponent = () => {
	const [data, setData] = React.useState(null);
	React.useEffect(() => {
    fetch('https://api.intra.42.fr/v2/accreditations')
      .then(response => response.json())
      .then(json => setData(json))
      .catch(error => console.error(error));
  }, []);
  console.log(data)

  
  return (
	<Box sx={{ display: 'flex', flexDirection: 'column',  alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
	<Grid container>

		{/* This is navigation */}
		<Grid item xs={12} >
				<NavBarMainPage></NavBarMainPage>
		</Grid>


		{/* This is main */}
		<Grid item xs={12} >
			<Box sx={{ flexGrow: 1, background: 'linear-gradient(to right, #EA4224 0%, #EDC24F 50%, #EA4224 100%)' }}>
				<Box display="flex" justifyContent="center" alignItems="center" sx={{height:"100vh"}}>
					<img src={angry} alt="calmScorpion" style={{ objectFit:"cover", width:"100%", height:"100%", opacity:"0.4"}}></img>
				</Box>
			</Box>	
		</Grid>


		{/* This is footer */}
		<Grid item xs={12}>
				<Footer></Footer>
		</Grid>
	</Grid>
	</Box>
  );
}

export default MainPage;