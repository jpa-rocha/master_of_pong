
const imgStyle = {
    background: 'linear-gradient(to right, #EA4224 0%, #c49b2b 50%, #EA4224 100%)',
};

const  btnClass = `
text-gray-900 text-lg uppercase
bg-transparent border border-gray-900
rounded-lg font-bold
px-5 py-2.5 w-60 my-5 2xl:w-80 2xl:text-3xl
transition ease-in-out delay-110 hover:-translate-x-1
hover:opacity-90 hover:border-none
hover:scale-110 hover:bg-gradient-to-br from-orange-500 via-red-200 to-yellow-200
`


const LandingPage: React.FunctionComponent = () => {
	return (
    <>
	<div className="flex flex-col justify-center items-center h-[100vh]" style={imgStyle}>
		<h1 className="text-5xl my-3 text-gray-900 xl:text-7xl 2xl:text-9xl italic">Master of Pong</h1>
		<button className={btnClass}>
			<a href={`${process.env.REACT_APP_BACKEND}api/auth/redirect`}>
				Login
			</a>
	</button>
	</div>
    </>
);
};

export default LandingPage;
