import React from "react";

const btnMenuStyle = `
py-2 px-3 text-lg 2xl:text-2xl
text-white rounded md:py-0
hover:bg-gray-100 hover:text-black md:hover:bg-transparent md:hover:text-white
 transition ease-in-out delay-110 hover:-translate-x-2
`;

interface HamburgerMenuProps {
  handleUserMain: (e: React.FormEvent) => void;
  handleGame: (e: React.FormEvent) => void;
  handleChat: (e: React.FormEvent) => void;
}

const HamburgerMenu: React.FunctionComponent<HamburgerMenuProps> = ({
  handleUserMain,
  handleGame,
  handleChat,
}) => {
  return (
    <>
      <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 rounded-lg md:flex-row md:space-x-8 md:mt-0">
        <li>
          <button
            className={btnMenuStyle}
            aria-current="page"
            onClick={handleUserMain}
          >
            Home
          </button>
        </li>
        <li>
          <button onClick={handleGame} className={btnMenuStyle}>
            Play
          </button>
        </li>
        <li>
          <button onClick={handleChat} className={btnMenuStyle}>
            Chat
          </button>
        </li>
      </ul>
    </>
  );
};

export default HamburgerMenu;
