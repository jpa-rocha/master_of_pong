import React from "react";

export default function MessageInput({
  send,
}: {
  send: (value: string) => void;
}) {
  const [value, setValue] = React.useState("");
  return (
    <>
      <div id="form">
        <input id="input" onChange={(e)=>setValue(e.target.value)} placeholder="Type your message ..." value={value} />
        <button className="button" onClick={() => send(value)}>Send</button>
      </div>
    </>
  );
}
