import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import { BrowserRouter } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import LandingPage from "./components/LandingPage";
import MainPage from "./components/MainPage";

// @ts-ignore

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
	<React.StrictMode>
	<BrowserRouter>
		<Routes>		
			<Route path="/" element={<App/>} />
		 	<Route path="/login" element={<Login/>} />
			<Route path="/home" element={<LandingPage/>} />
			<Route path="/main" element={<MainPage/>} />
			
		</Routes>
	</BrowserRouter> 
	 </React.StrictMode>
);


