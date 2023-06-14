export default function Messages({ messages }: { messages: string[] }) {

	const messageStyle = {
		backgroundColor: 'lightgrey',
		borderRadius: '10px',
		padding: '5px',
		marginBottom: '5px',
		marginLeft: '10px',
		marginRight: '10px',
		fontSize: '30px',
		width: 'fit-content'
	};

	return (
	  <>
		<div id="messages">
		  {messages.map((messages, index) => (
			<div style={messageStyle} key={index}>
				{messages}
			</div>
		  ))}
		</div>
	  </>
	);
  }