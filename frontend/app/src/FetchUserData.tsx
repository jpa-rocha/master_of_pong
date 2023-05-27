import React, { useEffect, useState } from 'react';


interface User {
  id: string;
  username: string;

}

const FetchUserData: React.FunctionComponent = () => {

	const [users, setUsers] = useState<User[]>([]);
	
	const baseURL = "https://api.intra.42.fr/oauth/authorize";

	useEffect(() => {
    	const fetchData = async () => {
      		try 
			{
        		const headers = new Headers();
        		headers.append('Content-Type', 'application/json');
				headers.append('Access-Control-Allow-Origin', '*');
				

        		const requestOptions = {
          			method: 'GET',
          			headers: headers,
        		};

        		const response = await fetch(baseURL, requestOptions);
        		const data = await response.json();
        		setUsers(data);
      		}
			catch (error) 
			{
        		console.error('Error fetching user data:', error);
      		}
    	};

    	fetchData();
  	}, []);

  return (
    <div>
      <h1>User Data</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.username}</li>
        ))}
      </ul>
    </div>
  );

};

export default FetchUserData;







export {};