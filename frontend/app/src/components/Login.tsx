import React from 'react';
import  '../styles/login.css'
import { useNavigate } from 'react-router-dom';


/* 
This is the Login Page */

const Login: React.FunctionComponent = () => {

	
	const navigate = useNavigate();

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		navigate('/main');
	  };

	return (

    <div>
		<div className='container'>
	<form id="form" onSubmit={handleSubmit}>
			<div className="form-item">
				<input id="username" type="text" name="username" placeholder="Username" autoComplete="on" required></input>
			</div>

			<div className="form-item">
				<input id="password" type="password" name="password" placeholder="Password" autoComplete="on" required></input>
			</div>
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