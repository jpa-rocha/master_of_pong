import React from "react";


/* This is Footer */

const Footer: React.FunctionComponent = () => {
  return (
	<footer className="bg-black rounded-sm shadow fixed bottom-0 left-0 right-0 w-full p-4 text-center">
		<span className="text-sm text-gray-200  mr-3">© 2023 
			<span  className="hover:underline text-center"> MasterofPong™</span>
		</span>

</footer>
  );
};

export default Footer;
