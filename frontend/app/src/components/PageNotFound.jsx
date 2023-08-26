import React from 'react'
//import { useEffect } from 'react';
import {Link } from 'react-router-dom';

const btnClass = `
focus:outline-none text-white bg-red-700 hover:bg-red-800 
focus:ring-4 focus:ring-red-300 font-medium rounded-lg 
text-sm px-6 py-2 my-4
`

const PageNotFound = () => {
/* 
 	const navigate = Navigate();

	useEffect( () => {
		const timer = setTimeout(() => {
			navigate('/');
		}, 5000);

		return () => clearTimeout(timer);
	}, [navigate]); */
	
  return (
	<div className="flex flex-col items-center justify-center h-[100vh]">
		<h1 className="font-bold text-gray-800 text-9xl">404</h1>
		<h6 className="text-5xl font-bold text-gray-600">
			<span className="text-red-500">Oops!</span> Page not found
		</h6>
		<p className="text-gray-500 mt-3">{" The page you're looking for dosen't exist."}</p>
		
			<button className={btnClass}><Link to="/">Return to Home Page</Link></button>
		
	</div>
  )
}

export default PageNotFound