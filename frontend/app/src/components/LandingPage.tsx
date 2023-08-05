
const imgStyle = {
    background: 'linear-gradient(to right, #EA4224 0%, #c49b2b 50%, #EA4224 100%)',
};

const  btnClass = `
text-gray-900 text-lg uppercase 
bg-transparent border border-gray-900 
rounded-lg 
px-5 py-2.5 w-60 my-5
focus:outline-none focus:ring-4 
focus:ring-gray-100 font-bold
transition ease-in-out delay-110 hover:-translate-x-1
hover:opacity-90
hover:scale-110 hover:bg-gradient-to-br from-orange-500 via-red-200 to-yellow-200
`


const LandingPage: React.FunctionComponent = () => {
	return (
    <>
	<div className="flex flex-col justify-center items-center h-[100vh]" style={imgStyle}> 
		<h1 className="text-4xl my-3 text-gray-900 xl:text-8xl italic">Master of Pong</h1> 
		<button className={btnClass}>
			<a href="http://localhost:5000/api/auth/redirect">
				Login
			</a>
	</button>
	</div> 
    </>
);
};

export default LandingPage;
