import React, { useState , useEffect } from 'react';
import logo from "../../images/logo.png";
import { useNavigate } from "react-router-dom";
import { getToken, getUser, getUserID } from "../../utils/Utils";
import HamburgerMenu from "./HamburgerMenu";

const btnToggleStyle = `
block px-4 py-2 
text-sm text-gray-700
hover:bg-gray-100
`


const NavBarTest: React.FunctionComponent = () => {
	
	const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
	const [hamburgerMenu, setHamburgerMenu] = useState<boolean>(false);
	const [userID, setUserID] = React.useState<string>("");
	const [profileImg, setProfileImg] = React.useState<string>("");
	const navigate = useNavigate();

	(async () => {
		setUserID(await getUserID(getToken("jwtToken")));
	})();

	useEffect(() => {
	  //console.log("UserID: " + userID);
	if (userID) {
		setProfileImg(`http://localhost:5000/api/users/avatars/${userID}`);
	}
	//console.log("Profile Image: " + profileImg);
	}, [userID, profileImg]);



	const getName = (value: String) => {
		return `${value.split(" ")[0][0]}${value.split(" ")[1][0]}`;
	};

	const handleDropdownToggle = () => {
		setIsDropdownOpen(!isDropdownOpen);
	};

	const handleHamburgerMenu = () => {
		setHamburgerMenu(!hamburgerMenu);
	}

	const handleGame = (e: React.FormEvent) => {
		e.preventDefault();
		navigate("/game");
	};

	const handleChat = (e: React.FormEvent) => {
		e.preventDefault();
		navigate("/chat");
	};

	const handleUserProfile = (e: React.FormEvent) => {
		e.preventDefault();
		navigate("/profile");
	};

	const handleFriends = (e: React.FormEvent) => {
		e.preventDefault();
		navigate("/friends");
	};

	const handleLeaders = (e: React.FormEvent) => {
		e.preventDefault();
		navigate("/");
	};

	const handleUserMain = (e: React.FormEvent) => {
		e.preventDefault();
		navigate("/main");
	};

return (
<>
    <nav className="bg-black border-gray-200 w-full">
        <div className="relative flex flex-wrap items-center justify-between px-5 py-4">
        	<img src={logo} alt="logo" className="h-[50px]" />
    		<div className="flex items-center md:order-2">
            <button
            	type="button"
            	className="flex mr-3 text-md bg-gray-200 rounded-full md:mr-0 focus:ring-4 focus:ring-gray-700"
            	id="user-menu-button"
            	aria-expanded={isDropdownOpen}
            	onClick={handleDropdownToggle}>
            	<img className="w-10 h-10 rounded-full" src={profileImg} alt="user" />
            </button>

            {isDropdownOpen && (
            <div className="absolute z-50 top-16 right-3 px-6 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow"
                id="user-dropdown">
                <div className="px-4 py-3">
                	<span className="block text-sm italic text-black">username</span>
                </div>
                <ul className="py-2" aria-labelledby="user-menu-button">
                	<li>
                    	<button onClick={handleUserProfile} className={btnToggleStyle}>
                    		Profile
                    	</button>
                	</li>
                	<li>
                		<button  onClick={handleLeaders} className={btnToggleStyle}>
						Leaders Board
                    	</button>
                	</li>
                	<li>
                		<button onClick={handleFriends} className={btnToggleStyle}>
							Find Friends
                    	</button>
                	</li>
                	<li>
                    	<a href="http://localhost:5000/api/auth/signout" className={btnToggleStyle}>
                    		Sign out
                    	</a>
                	</li>
                </ul>
            </div>
            )}
        	</div>

			<button data-collapse-toggle="navbar-user" type="button" 
				className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden
						hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200" 
						aria-controls="navbar-user" aria-expanded={hamburgerMenu}  onClick={handleHamburgerMenu} 
			>
				<svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
					<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15"/>
				</svg>
			</button>

			{hamburgerMenu && (
			<div className="absolute z-50 top-16 right-3 px-6 text-base list-none bg-black divide-y divide-gray-100 rounded-lg shadow" id="navbar-user">
				<HamburgerMenu
					handleUserMain={handleUserMain}
					handleGame={handleGame}
					handleChat={handleChat}
				></HamburgerMenu>
			</div>
			)}
		
			<div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-user">
				<HamburgerMenu
					handleUserMain={handleUserMain}
					handleGame={handleGame}
					handleChat={handleChat}
				></HamburgerMenu>
			</div>

        </div>
    </nav>
</>
);
};

export default NavBarTest;
