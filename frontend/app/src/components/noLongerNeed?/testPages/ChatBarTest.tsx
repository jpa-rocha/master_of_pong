import React from 'react';

const ChatBarTest: React.FC = () => {
  return (
    <div className="flex flex-col py-8 pl-6 pr-2 mt-3 rounded-2xl w-64 bg-gray-100 flex-shrink-0">
		  <div className="flex flex-row items-center justify-start h-3 w-full">
            <div className="flex items-center justify-center rounded-2xl text-white bg-gray-800 h-10 w-10">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <div className="ml-2 font-bold text-2xl">Chat</div>
          </div>
        
          <div className="flex flex-col mt-8">
            <div className="flex flex-row items-center justify-between text-xs">
              <span className="font-bold">Friends</span>
            </div>
            <div className="flex flex-col space-y-1 mt-4 -mx-2 h-48 overflow-y-auto">
              <button className="flex flex-row items-center hover:bg-gray-100 rounded-xl p-2">
                <div className="flex items-center justify-center h-8 w-8 bg-indigo-200 rounded-full">H</div>
                <div className="ml-2 text-sm font-semibold">Henry Boyd</div>
              </button>
            </div>
          </div>
		  <div className="flex flex-col mt-2">
            <div className="flex flex-row items-center justify-between text-xs">
              <span className="font-bold">Chat Rooms</span>
            </div>
            <div className="flex flex-col space-y-1 mt-2 mx-2 h-48 overflow-y-auto">
              <button className="flex flex-row items-center hover:bg-gray-100">
			  create chatRoom
              </button>
			  <button className="flex flex-row items-center hover:bg-gray-100">
			  join chatRoom
              </button>
			  
            </div>
          </div>
    </div>
  );
};

export default ChatBarTest;
