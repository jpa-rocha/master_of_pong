import React from "react";

export default function MessageInput({
  send,
}: {
  send: (value: string) => void;
}) {
  const [value, setValue] = React.useState("");
  const handleSend = () => {
    send(value);
    setValue("");
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };
  return (
    <>
      <div id="form">
        <input
          id="input"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message ..."
          value={value}
        />
        <button className="button" onClick={handleSend}>
          Send
        </button>
      </div>
    </>
  );
}
