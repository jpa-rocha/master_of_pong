import axios from "axios";
import { on } from "events";

axios.defaults.baseURL = "http://localhost:5000/";

type Prop = {
  isOpen: boolean;
  onClose: () => void;
  UserId: { id: string } | string;
};

const NameChangePopUp: React.FC<Prop> = ({ isOpen, onClose, UserId }) => {
  const setUser = async (newName: string) => {
    console.log("SetUser function called");
    const data = { username: newName };
    const config = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://localhost:3000",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE",
      },
    };
    if (UserId !== undefined) {
      const response = await axios.patch(`api/users/${UserId}`, data, config);
      if (response.status === 200) {
        // setUserName(newName);
      }
    }
  };
  
  const handleUserNameChange = async (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {

    if (event.key === "Enter") {
      event.preventDefault();
      let newname = event.currentTarget.value.trim()
      if (newname.length > 15) {
        alert("Username must be less than 15 characters");
        return;
      }
      if (newname.length < 3) {
        alert("Username must be more than 3 characters");
        return;
      }
      setUser(newname);
      onClose();
    }
  };

  if (!isOpen) return null;
  return (
    <>
      <div className="relative bg-white rounded-lg shadow p-6">
        <button
          className="absolute top-3 right-3 text-gray-400 bg-transparent
	  	hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto "
          onClick={onClose}
        >
          X
        </button>
        <form>
          <input
            required
            maxLength={15}
            minLength={3}
            type="text"
            placeholder="Enter new username"
            onKeyDown={handleUserNameChange}
            className="m-6 bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-900
			focus:border-blue-500 block p-2.5"
          />
        </form>
      </div>
    </>
  );
};

export default NameChangePopUp;
