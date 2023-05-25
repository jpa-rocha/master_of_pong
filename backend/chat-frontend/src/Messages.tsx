// import React from "react";

export default function Message({ messages }: { messages: string[] }) {
  return (
    <div id="messages">
      {/* <ul id="messages"></ul> */}
      {messages.map((messages, index) => (
        <div key={index}>{messages}</div>
      ))}
    </div>
  );
}
