import { Grid, Box, Button } from "@mui/material";
import calm from "../images/CalmScorpion.gif";
import Footer from "./Footer";
import NavBarLandingPage from "./NavBarLandingPage";

const LandingPage: React.FunctionComponent = () => {
  return (
    <>
      <Grid container style={{ position: "relative"}}>
        <Grid item xs={12} style={{ position: "relative", zIndex: 3 }}>
          
          <Box sx={{ flexGrow: 3, position: "relative", zIndex: 3 }}>
            <NavBarLandingPage></NavBarLandingPage>
          </Box>

          <Box
            sx={{
              flexGrow: 1,
              background:
                "linear-gradient(to right, #EA4224 0%, #EDC24F 50%, #EA4224 100%)",
              position: "relative",
              zIndex: 1,
            }}
          >
            <Box
              // display="relative"
              // justifyContent="center"
              // alignItems="center"
              sx={{ flexGrow: 2, height: "100vh", position: "relative", zIndex: 2 }}
            >
              <img
                src={calm}
                alt="calmScorpion"
                style={{
                  objectFit: "cover",
                  width: "100%",
                  height: "100%",
                  opacity: "0.4",
                }}
              ></img>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default LandingPage;
