
import logo from "../../images/logo.png";

const  btnClass = `
text-black w-50 px-6
rounded uppercase font-semibold
text-sm 
`
const btnStyle = {
    background: 'linear-gradient(to right, #EA4224 0%, #EDC24F 50%, #EA4224 100%)',
};

/* This is the Navigation Section for the Landing Page */
const NavBarLandingPage: React.FunctionComponent = () => {
	return (
	<>
	<nav className="flex justify-between bg-black border-gray-200 mx-auto py-4 px-6">
		<span className="text-md text-white italic whitespace-nowrap m-3 cursor-pointer">Master of Pong</span>
		<img src={logo} alt="logo" className='h-[50px]'/>
		<button className={btnClass} style={btnStyle}>
			<a href="http://localhost:5000/api/auth/redirect" className='p-2'>
				Login
			</a>
		</button>
	</nav>
</>

);
};

export default NavBarLandingPage;
