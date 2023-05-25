import React from 'react';
import  '../styles/login.css'
import { useNavigate } from 'react-router-dom';


/* 
This is the Login Page 

*/

const Login: React.FunctionComponent = () => {

	const navigate = useNavigate();
	
		/* 
		example :
		https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-064a71c5c3a2b98669be43b3e76df81d56f590615ee56de4481638789ad90afd&redirect_uri=https%3A%2F%2F127.0.0.1%3A3000%2Fmain&response_type=code
		 */

	/* TODO: Get clinetID 	
	const redirectURI = "..../main";
		const clinentID = ""; */
	
	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		// navigate('/main');

		/*  TODO: instead of navigate('/main), we need 42 API : */

		/* const apiURL = `https://api.intra.42.fr/oauth/authorize?client_id=${clientID}&redirect_uri=${redirectURI}&response_type=code`;
		window.location.href = apiURL; 
		
		*/
		// API call and authorization, whats the next step,
		// it should redirect to MainPage but should the user name be gotten there?
		// Or should it redirect to an intermediary page? that just stores the user in the db?
		const apiURL = "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-21777d9ab5dd446dbc857420566faa413fd62652c1e6699de8ad7a306587ba4d&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fmain&response_type=code"
	
		window.location.href = apiURL; 
	};


	return (

    <div>
		<div className='container'>
	<form id="form" onSubmit={handleSubmit}>
			{/* <div className="form-item">
				<input id="username" type="text" name="username" placeholder="Username" autoComplete="on" required></input>
			</div>

			<div className="form-item">
				<input id="password" type="password" name="password" placeholder="Password" autoComplete="on" required></input>
			</div> */}
			<div className="form-item">
				<button id="button" className="button" type="submit" value="Login">Sign In</button>
			</div>
			<div className="form-item">
				<a href='/#'>
					<p>Don't have your password?</p>
				</a>
			</div>
		
		</form>
		
		</div>
	</div>
  );
}


export default Login;