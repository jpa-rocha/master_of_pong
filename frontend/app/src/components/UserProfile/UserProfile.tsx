import React, { useEffect, useState } from 'react';

interface Friends {
	userName: string;
}

interface User {
	userName: string;
	image: string;
	friends: Friends[];
}

const UserProfile: React.FunctionComponent<User> = ({ userName, image, friends }) => {

	const [userProfile, setUserProfile] = useState<User | null>(null);

	useEffect( () => {
		// Simulating an API call to fetch user profile data
		const fetchUserProfile = async () => {

			try {
				const data = {
					userName: "JDoe",
					image: "./",
					friends: [
						{
							userName: "mg",
						},
						{
							userName: "hi",
						}] 
				  };
		
			  //const response = await fetch('/api/...');
			  //const data = await response.json();
			  setUserProfile(data);

			} catch (error) {
			  console.error('Error fetching user profile:', error);
			}
		  };
	  
		  fetchUserProfile();
	}, []);


  return (
	<div className='container'>
	{userProfile ? (
		<>
          <h2>{userProfile.userName}</h2>
		  <ul>
			{userProfile.friends.map( (friend, index) => (
				<li key={index}>
					{friend.userName}
				</li>
			))}
		  </ul>
		</>
      ) : (
        <p>Loading user profile...</p>
      )}
    </div>
  )
}

export default UserProfile