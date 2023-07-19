import React, { useEffect, useState } from 'react';

interface User {
  id: string;
  username: string;
}

const FetchUserData: React.FunctionComponent = () => {

	const [users, setUsers] = useState<User[]>([]);
	
	
	const baseURL = `http://localhost:5000/api/users/`;

	useEffect(() => {
    	const fetchData = async () => {
      		try 
			{
        		const response = await fetch(baseURL);
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