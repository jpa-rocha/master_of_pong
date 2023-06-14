import { Grid, Box } from "@mui/material";
import calm from "../images/CalmScorpion.gif"
import Footer from "./Footer";
import NavBarLandingPage from "./NavBarLandingPage";
import Chat from './Messages/Chat'
import GameCanvas from './GameCanvas/GameCanvas'


const LandingPage = () => {

	return (
	<>
		<Grid container>
		{/* This is navigation */}

			<Grid item xs={12} >
				<NavBarLandingPage></NavBarLandingPage>
			</Grid>

		{/* This is main */}
		<Grid item xs={12}>
			<Box sx={{ flexGrow: 1, background: 'linear-gradient(to right, #EA4224 0%, #EDC24F 50%, #EA4224 100%)' }}>
				<Box display="flex" justifyContent="center" alignItems="center" sx={{ height: '100vh', position: 'relative' }}>
					<img src={calm} alt="calmScorpion" style={{ objectFit: 'cover', width: '100%', height: '100%', opacity: '0.4' }}></img>

					<div
					style={{
						display: 'flex',
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						flexDirection: 'row',
					}}
					>
					<div style={{ flex: 1, display: 'flex' }}>
						<Chat />
					</div>
					<div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
						<GameCanvas />
					</div>
					</div>
				</Box>
			</Box>
		</Grid>

		{/* This is footer */}
			<Grid item xs={12}>
				<Footer></Footer>
			</Grid>
		</Grid>
	</>
	)
}

export default LandingPage;