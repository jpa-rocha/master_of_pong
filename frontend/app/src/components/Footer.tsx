import React from "react";


/* This is Footer */

const Footer: React.FunctionComponent = () => {
  return (
	<footer className="bg-black rounded-sm shadow fixed bottom-0 left-0 right-0">
	<div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
		<span className="text-sm text-gray-200 sm:text-center dark:text-gray-400 mr-3">© 2023 
			<span  className="hover:underline"> MasterofPong™</span>
		</span>
		<ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-200 sm:mt-0">
			<li><span className="mr-4 hover:underline md:mr-6 "></span></li>
		</ul>
    </div>
</footer>
  );
};

export default Footer;
