// import React from "react";

export default function Message({ messages }: { messages: string[] }) {
  return (
    <>
      <div id="messages">
        {messages.map((messages, index) => (
          <li key={index}>{messages}</li>
        ))}
      </div>
    </>
  );
}
