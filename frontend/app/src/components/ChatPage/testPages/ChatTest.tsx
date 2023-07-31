import React from 'react';
import ChatBarTest from './ChatBarTest';
import ChatBodyTest from './ChatBodyTest';
import ChatFooterTest from './ChatFooterTest';

const ChatTest: React.FC = () => {
  return (
    <div className="flex h-screen text-gray-800 md-p-20 "> 
      <div className="flex h-4/5 flex-row w-full ">
       <ChatBarTest></ChatBarTest>

        <div className="flex flex-col flex-auto h-full p-6">
          <div className="flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-100 h-full p-4">
		<ChatBodyTest></ChatBodyTest>
		<ChatFooterTest></ChatFooterTest>
        
          </div>
        </div>
      </div>
   </div> 
  );
};

export default ChatTest;
