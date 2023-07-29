import NavBarLandingPage from "./Navigation/NavBarLandingPage";
import calm from "../images/CalmScorpion.gif";
import Footer from "./Footer";
import { Grid } from "@mui/material"

const imgStyle = {
    background: 'linear-gradient(to right, #EA4224 0%, #EDC24F 50%, #EA4224 100%)',
};

const LandingPage: React.FunctionComponent = () => {
	return (
    <>
	<Grid container>
		<Grid item xs={12}>
			<NavBarLandingPage></NavBarLandingPage>
		</Grid>
		<Grid item xs={12}>
			<div className="relative h-[100vh]"> 
				<img className="w-full h-[100vh]" src={calm} alt="calm"></img>
				<div className="absolute inset-0  opacity-50" style={imgStyle}></div> 
			</div> 
		</Grid>
		<Grid item xs={12}>
			<Footer></Footer>
		</Grid>
	</Grid>
	
    </>
);
};

export default LandingPage;
