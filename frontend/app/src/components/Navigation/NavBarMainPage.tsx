import React, { useState, useEffect, useRef } from "react";
import logo from "../../images/logo.png";
import { useNavigate } from "react-router-dom";
import { getToken, getUserID, AxiosConfig } from "../../utils/Utils";
import HamburgerMenu from "./HamburgerMenu";
import axios from "axios";
import PopUpGenerate2fa from "../Profile/PopUpGenerate2fa";
import PopUpTurnOff2fa from "../Profile/PopUp2faInput";
import { Socket } from "socket.io-client";
import IncomingChallengePopUp from "../../utils/incomingChallengePopUp";

const btnToggleStyle = `
block px-4 py-2  2xl:text-xl 2xl:px-6 2xl:py-2
text-md text-gray-700 text-center
hover:bg-gray-800 rounded-lg hover:text-white
`;

interface UserProps {
  id: string;
  username: string;
  is_2fa_enabled: boolean;
}

interface ChallengeDetails {
  mode: number;
  hyper: boolean;
  dodge: boolean;
  character: number;
  paddle: number;
  challengerID: string;
  userID: string;
  challengerUsername: string;
}

interface ChallengeProp {
  challengeDetails: ChallengeDetails;
  isChallengePopUp: boolean;
}

interface NavBarProps {
  socket: Socket;
}

const NavBarTest: React.FunctionComponent<NavBarProps> = ({ socket }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [hamburgerMenu, setHamburgerMenu] = useState<boolean>(false);
  const [userID, setUserID] = React.useState<string>("");
  const [profileImg, setProfileImg] = React.useState<string>("");
  const [userInfo, setUserInfo] = React.useState<UserProps>();
  const [toggle2fa, setToggle2fa] = useState<boolean>(false);
  const [generate2fa, setGenerate2fa] = useState<boolean>(false);
  const [toggle2faTurnOff, setToggle2faTurnOff] = useState<boolean>(false);
  const navigate = useNavigate();
  const dropdownMenuRef = useRef<HTMLDivElement>(null);
  const hamburgerMenuRef = useRef<HTMLDivElement>(null);

  const [isChallengePopUp, setIsChallengePopUp] = useState(false);
  const [challenges, setChallenges] = useState<ChallengeProp[]>([]);

  useEffect(() => {
    function handleIncomingChallenge(result: ChallengeDetails) {
      const newChallenge = {
        challengeDetails: result,
        isChallengePopUp: true,
      };
      challenges.push(newChallenge);
      setChallenges(challenges);
      setIsChallengePopUp(true);
    }

    function handleFailedToJoin() {
      alert("Opponent failed to join");
    }

    socket.on("challenge", handleIncomingChallenge);
    socket.on("failedToJoin", handleFailedToJoin);
    return () => {
      socket.off("challenge", handleIncomingChallenge);
      socket.off("failedToJoin", handleFailedToJoin);
    };
  }, [socket, challenges]);

  function removeChallenge() {
    setIsChallengePopUp(false);
    const updatedChallenges = challenges.slice(1);
    setChallenges(updatedChallenges);
    if (updatedChallenges.length !== 0) setIsChallengePopUp(true);
  }

  function removeAll() {
    setChallenges([]);
    setIsChallengePopUp(false);
  }

  useEffect(() => {
    (async () => {
      try {
        setUserID(
          await getUserID(getToken(process.env.REACT_APP_JWT_NAME as string))
        );
      } catch (error) {
        window.location.reload();
      }
    })();
    if (userID && userID !== "") {
      setProfileImg(
        `${process.env.REACT_APP_BACKEND}/api/users/avatars/${userID}`
      );
      (async () => {
        try {
          const user = await axios.get<UserProps>(
            `${process.env.REACT_APP_BACKEND}/api/users/${userID}`,
            AxiosConfig
          );
          setUserInfo(user.data);
          setToggle2fa(user.data.is_2fa_enabled);
        } catch {
          window.location.reload();
        }
      })();
    }
  }, [userID, profileImg, toggle2fa, generate2fa, toggle2faTurnOff]);

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleHamburgerMenu = () => {
    setHamburgerMenu(!hamburgerMenu);
  };

  useEffect(() => {
    const handleDropdownOutsideClick = (e: MouseEvent) => {
      if (
        dropdownMenuRef.current &&
        !dropdownMenuRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleDropdownOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleDropdownOutsideClick);
    };
  }, []);

  useEffect(() => {
    const handleHamburgerOutsideClick = (e: MouseEvent) => {
      if (
        hamburgerMenuRef.current &&
        !hamburgerMenuRef.current.contains(e.target as Node)
      ) {
        setHamburgerMenu(false);
      }
    };

    document.addEventListener("mousedown", handleHamburgerOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleHamburgerOutsideClick);
    };
  }, []);

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
    navigate("/leaders");
  };

  const handleUserMain = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/main");
  };

  const close2faGeneratePopUp = () => {
    setGenerate2fa(false);
  };

  const handle2faButton = () => {
    if (toggle2fa) {
      setToggle2faTurnOff(true);
    } else {
      setGenerate2fa(true);
    }
  };

  const close2faTurnOffPopUp = () => {
    setToggle2faTurnOff(false);
  };

  return (
    <>
      <nav className="bg-black border-gray-200 w-full">
        <div
          ref={dropdownMenuRef}
          className="relative flex flex-wrap items-center justify-between px-5 py-4"
        >
          <div className="flex items-center md:order-2">
            <button
              type="button"
              className="flex mr-3 text-md bg-gray-200 rounded-full md:mr-0"
              id="user-menu-button"
              aria-expanded={isDropdownOpen}
              onClick={handleDropdownToggle}
            >
              <img
                className="w-10 h-10 rounded-full object-cover"
                src={profileImg}
                alt="user"
              />
            </button>
            {isDropdownOpen && (
              <div className="absolute z-50 top-16 md:right-0 sx:left-0 px-6 2xl:px-10 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow">
                <div className="px-4 py-3">
                  <span className="block text-sm 2xl:text-xl italic text-black">
                    {userInfo?.username}
                  </span>
                </div>
                <ul className="py-2" aria-labelledby="user-menu-button">
                  <li>
                    <button
                      onClick={handleUserProfile}
                      className={btnToggleStyle}
                    >
                      Profile
                    </button>
                  </li>
                  <li>
                    <button onClick={handleLeaders} className={btnToggleStyle}>
                      Leaderboard
                    </button>
                  </li>
                  <li>
                    <button onClick={handleFriends} className={btnToggleStyle}>
                      Find Friends
                    </button>
                  </li>
                  <li>
                    <div className="py-2 px-4">
                      <button onClick={handle2faButton}>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            value=""
                            className="sr-only peer"
                            onChange={() => {}}
                            checked={toggle2fa}
                            id="2facheck"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          <span className="ml-3 x-4 text-md 2xl:text-xl font-medium text-gray-900"></span>
                          <div>2fa</div>
                        </label>
                      </button>
                    </div>
                  </li>
                  <li>
                    <a
                      href={`${process.env.REACT_APP_BACKEND}/api/auth/signout`}
                      className={btnToggleStyle}
                    >
                      Sign out
                    </a>
                  </li>
                </ul>
              </div>
            )}
          </div>
          <div ref={hamburgerMenuRef}>
            <div className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden focus:outline-none">
              <img
                src={logo}
                alt="logo"
                className="h-[50px] absolute left-[50%] right-[50%]"
              />
            </div>
            <button
              data-collapse-toggle="navbar-user"
              type="button"
              className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden
                          hover:bg-gray-100 focus:outline-none"
              aria-controls="navbar-user"
              aria-expanded={hamburgerMenu}
              onClick={handleHamburgerMenu}
            >
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 17 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 1h15M1 7h15M1 13h15"
                />
              </svg>
            </button>
            {hamburgerMenu && (
              <div className="absolute z-50 top-16 right-0 px-6 2xl:px-10 text-base list-none bg-black rounded-lg shadowght-3 bg-black rounded-lg shadow">
                <HamburgerMenu
                  handleUserMain={handleUserMain}
                  handleGame={handleGame}
                  handleChat={handleChat}
                ></HamburgerMenu>
              </div>
            )}
          </div>
          <div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1">
            <img
              src={logo}
              alt="logo"
              className="h-[50px] absolute left-5 object-cover"
            />
            <HamburgerMenu
              handleUserMain={handleUserMain}
              handleGame={handleGame}
              handleChat={handleChat}
            ></HamburgerMenu>
            {/* ); */}
          </div>
        </div>
      </nav>
      {generate2fa && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <PopUpGenerate2fa
            isOpen={generate2fa}
            onClose={close2faGeneratePopUp}
            userID={userInfo?.id}
          />
        </div>
      )}
      {toggle2faTurnOff && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <PopUpTurnOff2fa
            isOpen={toggle2faTurnOff}
            onClose={close2faTurnOffPopUp}
            UserId={userID}
            off={true}
          />
        </div>
      )}
      {isChallengePopUp &&
        challenges &&
        challenges[0] &&
        challenges[0].challengeDetails && (
          <div
            style={{
              position: "fixed",
              top: "20%",
              left: 0,
              width: "20%",
              height: "10%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 999,
            }}
          >
            <IncomingChallengePopUp
              isOpen={challenges[0].isChallengePopUp}
              onClose={removeChallenge}
              onCloseAll={removeAll}
              challengeDetais={challenges[0].challengeDetails}
              socket={socket}
            />
          </div>
        )}
    </>
  );
};

export default NavBarTest;
