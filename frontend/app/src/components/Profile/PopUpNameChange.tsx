import axios from "axios";

axios.defaults.baseURL = process.env.REACT_APP_BACKEND;

type Prop = {
  isOpen: boolean;
  onClose: (newName: string) => void;
  UserId: { id: string } | string;
};

const NameChangePopUp: React.FC<Prop> = ({ isOpen, onClose, UserId }) => {
  const setUser = async (newName: string) => {
    const data = { username: newName };
    const config = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": process.env.REACT_APP_FRONTEND,
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE",
      },
    };
    if (UserId !== undefined) {
      await axios
        .patch(`api/users/change/name/${UserId}`, data, config)
        .then((res) => {
          alert(res.data.message);
          onClose(newName);
        })
        .catch((err) => {
          if (err.response.status === 400) {
            alert("User name already exists");
            onClose("");
          }
        });
    }
  };

  const handleUserNameChange = async (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      let newname = event.currentTarget.value.trim();
      if (newname.length > 15) {
        alert("Username must be less than 15 characters");
        return;
      }
      if (newname.length < 3) {
        alert("Username must be more than 3 characters");
        return;
      }
      /* check if there are special characters */
      if (!/^[a-zA-Z0-9]+$/.test(newname)) {
        alert("Username must be alphanumeric");
        return;
      }
      setUser(newname);
    }
  };

  if (!isOpen) return null;
  return (
    <>
      <div className="relative bg-white rounded-lg shadow p-6">
        <button
          className="absolute top-3 right-3 text-gray-400 bg-transparent
	  	hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto "
          onClick={() => onClose("")}
        >
          X
        </button>
        <form id="newname">
          <input
            required
            maxLength={15}
            minLength={3}
            type="text"
            placeholder="Enter new username"
            onKeyDown={handleUserNameChange}
            className="m-6 bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-900
			focus:border-blue-500 block p-2.5"
            title="must be between 3 and 15 characters"
            id="changename"
          />
        </form>
      </div>
    </>
  );
};

export default NameChangePopUp;
