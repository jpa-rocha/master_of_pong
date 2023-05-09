import React from "react";
import "./styles/App.css";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Grid from "@mui/material/Grid";
import { Toolbar, AppBar, TextField } from "@mui/material";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";

/* import { createTheme } from '@mui/material/styles';

const theme = createTheme({
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
});
 */

const App: React.FunctionComponent = () => {
  return (
    <Container
      sx={{ backgroundColor: "grey.A700", height: "100vh", width: "100vw" }}
    >
      {/*     <Box  sx={{backgroundColor: "grey.A700", height: "100vh", width: "100vw" }}> */}
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
        {/*   <Grid container>
          <Grid item> */}
        <p>hello</p>
        {/*  </Grid>
        </Grid> */}
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
      {/*      </Box> */}
    </Container>
  );
};

export default App;
