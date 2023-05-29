import React from "react";

var Chatname: string = "";

function Username() {
  const [value, setValue] = React.useState("");
  return (
    <>
      <div id="username">
        <input
          id="input"
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type your username..."
          value={value}
        />
        {(Chatname = value)}
      </div>
    </>
  );
}

export default Username;
export { Chatname };
