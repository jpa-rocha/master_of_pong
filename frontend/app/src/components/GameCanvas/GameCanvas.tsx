import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import io, { Socket } from "socket.io-client"
import GetOverHere from '../../sounds/getOverHere.mp3'
import SoundGrenade from '../../sounds/Sound_Grenade.mp3'
import { Button } from './Canvas'
import paddle_scorpion from '../../images/scorpion_paddle.png'
import paddle_subzero from '../../images/subzero_paddle.png'
import big_paddle from "../../images/BigPaddle.png"
import regular_paddle from "../../images/RegularPaddle.png"
import small_paddle from "../../images/SmallPaddle.png"
import ice_block from '../../images/iceBlock.png'

axios.defaults.baseURL = 'http://localhost:3333';

type GameComponentProps = {};

const GameComponent: React.FC<GameComponentProps> = () => {
const paddle_s = useMemo(() => {
	var img = new Image();
	img.src = paddle_scorpion;
	return img;
}, []);
const paddle_sub = useMemo(() => {
	var img = new Image();
	img.src = paddle_subzero;
	return img;
}, []);
const iceBlock = useMemo(() => {
	var img = new Image();
	img.src = ice_block;
	return img;
}, []);
const paddle_small = useMemo(() => {
	var img = new Image();
	img.src = small_paddle;
	return img;
}, []);
const paddle_regular = useMemo(() => {
	var img = new Image();
	img.src = regular_paddle;
	return img;
}, []);
const paddle_big = useMemo(() => {
	var img = new Image();
	img.src = big_paddle;
	return img;
}, []);

const [player1Position, setPlayer1Position] = useState<number>(250);
const [player2Position, setPlayer2Position] = useState<number>(250);
const [ballPosition, setBallPosition] = useState<{ x: number; y: number }>({ x: 400, y: 300 });
const [score, setScore] = useState<{ p1: number; p2: number }>({ p1: 0, p2: 0 });
const [ultimate, setUlitimate] = useState<boolean>(false);
const [subZeroUlt, setSubZeroUlt] = useState<boolean>(false);
const [freeze, setFreeze] = useState<boolean>(false);
const [lightning, setLightning] = useState<boolean>(false);
//   const [timeWarp, setTimeWarp] = useState<boolean>(false);
const [mirage, setMirage] = useState<boolean>(false);
const [miragePos, setMiragePos] = useState([]);
const [winner, setWinner] = useState<string>("");
const [arrowDown, setArrowDown] = useState<boolean>(false);
const [arrowUp, setArrowUp] = useState<boolean>(false);
const [isGameStarted, setGameStarted] = useState<boolean>(false);
const [ballSize, setBallSize] = useState<number>(10);

const canvasRef = useRef<HTMLCanvasElement | null>(null);
const socket = useRef<Socket | null>(null);

const canvas = canvasRef.current;
const ctx = canvas?.getContext('2d');

//   const selectedGamemode = useMemo(() => { return false;  }, [])
const [selectedGamemode, setSelectedGamemode] = useState<boolean>(false);
const [selectedPaddle, setSelectedPaddle] = useState<boolean>(false);
const [selectedCharacter, setSelectedCharacter] = useState<boolean>(false);
//   const selectedGamemodeRef = React.useRef(selectedGamemode);
//   const [redrawButtons, setRedrawButtons] = useState<boolean>(false);

const [render, setRender] = useState<boolean>(false);

const backgroundColor = "rgb(100, 100, 100)"


const gamemodeButtons = useMemo(() => {
	var Singleplayer:Button = new Button("Singleplayer", {x:200, y:50}, {x:30, y:70});
	var MasterOfPong:Button = new Button("Master Of Pong", {x:200, y:50}, {x:300, y:70});
	var RegularPong:Button = new Button("Regular Pong", {x:200, y:50}, {x:570, y:70});
	var GameStart:Button = new Button("Start Game", {x: 200, y:50}, {x:300, y:500});
	if (canvas)
	{
		Singleplayer.setSizeLocation({x:200 * canvas.width / 800, y:50 * canvas.height / 600}, {x:30 * canvas.width / 800, y:70 * canvas.height / 600});
		MasterOfPong.setSizeLocation({x:200 * canvas.width / 800, y:50 * canvas.height / 600}, {x:300 * canvas.width / 800, y:70 * canvas.height / 600});
		RegularPong.setSizeLocation({x:200 * canvas.width / 800, y:50 * canvas.height / 600}, {x:570 * canvas.width / 800, y:70 * canvas.height / 600});
		GameStart.setSizeLocation({x:200 * canvas.width / 800, y:50 * canvas.height / 600}, {x:300 * canvas.width / 800, y:500 * canvas.height / 600});
	}
	return [Singleplayer, MasterOfPong, RegularPong, GameStart];
}, [canvas]);

const paddleButtons = useMemo(() => {
	var SmallPaddle:Button = new Button("Small Paddle", {x:200, y:50}, {x:30, y:220});
	var RegularPaddle:Button = new Button("Average Joe", {x:200, y:50}, {x:300, y:220});
	var BigPaddle:Button = new Button("Big Pete", {x:200, y:50}, {x:570, y:220});
	if (canvas)
	{
		console.log("Scaling the buttons");
		SmallPaddle.setSizeLocation({x:200 * canvas.width / 800, y:100 * canvas.height / 600}, {x:30 * canvas.width / 800, y:220 * canvas.height / 600});
		RegularPaddle.setSizeLocation({x:200 * canvas.width / 800, y:100 * canvas.height / 600}, {x:300 * canvas.width / 800, y:220 * canvas.height / 600});
		BigPaddle.setSizeLocation({x:200 * canvas.width / 800, y:100 * canvas.height / 600}, {x:570 * canvas.width / 800, y:220 * canvas.height / 600});
	}
	return [SmallPaddle, RegularPaddle, BigPaddle];
}, [canvas]);

const characterButtons = useMemo(() => {
	var Scorpion:Button = new Button("Scorpion", {x:20, y:100}, {x:30, y:360});
	var SubZero:Button = new Button("SubZero", {x:20, y:100}, {x:300, y:360});
	if (canvas)
	{
		Scorpion.setSizeLocation({x:20 * canvas.width / 800, y:100 * canvas.height / 600}, {x:30 * canvas.width / 800, y:360 * canvas.height / 600});
		SubZero.setSizeLocation({x:20 * canvas.width / 800, y:100 * canvas.height / 600}, {x:300 * canvas.width / 800, y:360 * canvas.height / 600});
	}
	return [Scorpion, SubZero];
}, [canvas]);

/*   const characterButtons = useMemo(() => {
	var RegularPaddle:Button = new Button("Big Paddle", {x:200, y:50}, {x:30, y:220});
	var SubzeroPaddle:Button = new Button("Subzero Paddle", {x:200, y:50}, {x:300, y:220});
	var ScorpionPaddle:Button = new Button("Scorpion Paddle", {x:200, y:50}, {x:570, y:220});

	return [RegularPaddle, SubzeroPaddle, ScorpionPaddle];
}, []); */


const handleStartGame = async () => {
	try {
		await axios.post('/game/start');
	} catch (error) {
	console.error('Failed to start the game:', error);
	}
};

const handleStopGame = async () => {
	setGameStarted(false);
	try {
		await axios.post('/game/stop');
	} catch (error) {
		console.error('Failed to stop the game:', error);
	}
};

const drawButton = useCallback((ctx: CanvasRenderingContext2D, button: Button, selected: boolean = false) => {
	ctx.fillStyle = backgroundColor;
	ctx.fillRect(button.coordinates.x, button.coordinates.y, button.size.x, button.size.y);
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillStyle = 'white';
	roundedRect(ctx, button.coordinates.x, button.coordinates.y, button.size.x, button.size.y, 20);
	if (!button.isFocused && !button.selected && !selected) {
		ctx.globalAlpha=.25;
		ctx.fillStyle="black";
		roundedRect(ctx, button.coordinates.x, button.coordinates.y, button.size.x, button.size.y, 20);
		ctx.globalAlpha=1;
	}
	ctx.font = '30px Arial';
	ctx.fillStyle = 'red';
	ctx.fillText(button.getName(), button.coordinates.x + button.size.x / 2, button.coordinates.y + button.size.y / 2);
	if (selected && !button.selected) {
		ctx.globalAlpha=.4;
		ctx.fillStyle="black";
		roundedRect(ctx, button.coordinates.x, button.coordinates.y, button.size.x, button.size.y, 20);
		ctx.globalAlpha=1;
	}
}, []);

const drawImages = useCallback((ctx: CanvasRenderingContext2D, button: Button, selected: boolean = false) => {
	var image: HTMLImageElement;
	if (button.name === "Small Paddle")
		image = paddle_small;
	else if (button.name === "Average Joe")
		image = paddle_regular;
	else if (button.name === "Big Pete")
		image = paddle_big;
	else if (button.name === "Scorpion")
		image = paddle_s;
	else //if (button.name === "SubZero")
		image = paddle_sub;
	ctx.fillStyle = backgroundColor;
	ctx.fillRect(button.coordinates.x, button.coordinates.y, button.size.x, button.size.y);
	ctx.drawImage(image, button.coordinates.x, button.coordinates.y, button.size.x, button.size.y);
	if (!button.isFocused && !button.selected && !selected) {
		ctx.drawImage(image, button.coordinates.x, button.coordinates.y, button.size.x, button.size.y);
		ctx.globalAlpha=.25;
		ctx.fillStyle="black";
		roundedRect(ctx, button.coordinates.x, button.coordinates.y, button.size.x, button.size.y, 10);
		ctx.globalAlpha=1;
	}
	if (selected && !button.selected) {
		ctx.drawImage(image, button.coordinates.x, button.coordinates.y, button.size.x, button.size.y);
		ctx.globalAlpha=.4;
		ctx.fillStyle="black";
		roundedRect(ctx, button.coordinates.x, button.coordinates.y, button.size.x, button.size.y, 10);
		ctx.globalAlpha=1;
	}
}, [paddle_s, paddle_sub, paddle_big, paddle_regular, paddle_small]);

function checkMouseOnButton(button: Button, e: MouseEvent, canvas: HTMLCanvasElement) {
	var mouseX = e.clientX - canvas.offsetLeft;
	var mouseY = e.clientY - canvas.offsetTop;
	if (mouseX > button.coordinates.x && mouseX < button.coordinates.x + button.size.x &&
		mouseY > button.coordinates.y && mouseY < button.coordinates.y + button.size.y)
		return true;
	return false;
}

const handleMouseMove = useCallback((e:MouseEvent) => {
	if (!canvas || !ctx)
		return;
	for (var index in gamemodeButtons) {
		if (checkMouseOnButton(gamemodeButtons[index], e, canvas))
			gamemodeButtons[index].isFocused = true;
		else if (gamemodeButtons[index].isFocused === true)
			gamemodeButtons[index].isFocused = false;
		drawButton(ctx, gamemodeButtons[index], selectedGamemode);
	}
	for (index in paddleButtons) {
		if (checkMouseOnButton(paddleButtons[index], e, canvas))
			paddleButtons[index].isFocused = true;
		else if (paddleButtons[index].isFocused === true)
			paddleButtons[index].isFocused = false;
		drawImages(ctx, paddleButtons[index], selectedPaddle);
	}
	for (index in characterButtons) {
		if (checkMouseOnButton(characterButtons[index], e, canvas))
			characterButtons[index].isFocused = true;
		else if (characterButtons[index].isFocused === true)
			characterButtons[index].isFocused = false;
		drawImages(ctx, characterButtons[index], selectedCharacter);
	}
}, [gamemodeButtons, paddleButtons, canvas, ctx, selectedGamemode, drawButton, selectedPaddle, characterButtons, selectedCharacter, drawImages]);
	
	const handleMouseClick = useCallback((e: MouseEvent) => {
		console.log("Handle mouse click");
		if (!canvas || !ctx)
			return;
		for (var index in gamemodeButtons) {
			if (checkMouseOnButton(gamemodeButtons[index], e, canvas)) {
				if (gamemodeButtons[index].getName() === 'Start Game') {
					if (selectedGamemode && selectedPaddle && selectedCharacter) {
						handleStartGame();
						setGameStarted(true);
						canvas.removeEventListener("mousemove", handleMouseMove);
						canvas.removeEventListener("click", handleMouseClick);
						return;
					}
					else {
						ctx.font = '30px Arial'; //ITC Zapf Chancery
						ctx.fillText("Choose game settings to continue", 400, 575);
					}
				}
				else if (selectedGamemode) {
					if (gamemodeButtons[index].selected) {
						console.log("Needs to unselect");
						gamemodeButtons[index].selected = false;
						setSelectedGamemode(false);
					}
					else {
						console.log("Needs to unselect old one, and select a new one");
						for (var button in gamemodeButtons) {
							if (gamemodeButtons[button].selected) {
								gamemodeButtons[button].selected = false;
								gamemodeButtons[index].selected = true;
								setSelectedGamemode(true);
							}
						}
					}
				}
				else {
					console.log("Selected a new one");
					setSelectedGamemode(true);
					gamemodeButtons[index].selected = true;
				}
				for (var toDraw in gamemodeButtons) {
					drawButton(ctx, gamemodeButtons[toDraw], selectedGamemode);
				}
				return;
			}
		}
		for (index in paddleButtons) {
			if (checkMouseOnButton(paddleButtons[index], e, canvas)) {
				if (selectedPaddle) {
					if (paddleButtons[index].selected) {
						console.log("Needs to unselect");
						paddleButtons[index].selected = false;
						setSelectedPaddle(false);
					}
					else {
						console.log("Needs to unselect old one, and select a new one");
						for (button in paddleButtons) {
							if (paddleButtons[button].selected) {
								paddleButtons[button].selected = false;
								paddleButtons[index].selected = true;
								setSelectedPaddle(true);
							}
						}
					}
				}
				else {
					console.log("Selected a new one");
					setSelectedPaddle(true);
					paddleButtons[index].selected = true;
				}
				for (toDraw in paddleButtons) {
					drawImages(ctx, paddleButtons[toDraw], selectedPaddle);
				}
				return;
			}
		}
		for (index in characterButtons) {
			if (checkMouseOnButton(characterButtons[index], e, canvas)) {
				if (selectedCharacter) {
					if (characterButtons[index].selected) {
						console.log("Needs to unselect");
						characterButtons[index].selected = false;
						setSelectedCharacter(false);
					}
					else {
						console.log("Needs to unselect old one, and select a new one");
						for (button in characterButtons) {
							if (characterButtons[button].selected) {
								characterButtons[button].selected = false;
								characterButtons[index].selected = true;
								setSelectedCharacter(true);
							}
						}
					}
				}
				else {
					console.log("Selected a new one");
					setSelectedCharacter(true);
					characterButtons[index].selected = true;
				}
				for (toDraw in characterButtons) {
					drawImages(ctx, characterButtons[toDraw], selectedCharacter);
				}
				return;
			}
		}
	}, [canvas, drawButton, ctx, gamemodeButtons, paddleButtons, handleMouseMove, selectedGamemode, selectedPaddle, characterButtons, selectedCharacter, drawImages]);
	

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, size_x: number, size_y: number, radius: number, clear: boolean = false) {
	if (clear)
	ctx.fillStyle='rgba(0,0,0,0)';
	ctx.beginPath();
	ctx.moveTo(x, y + radius);
	ctx.arcTo(x, y + size_y, x + radius, y + size_y, radius);
	ctx.arcTo(x + size_x, y + size_y, x + size_x, y + size_y - radius, radius);
	ctx.arcTo(x + size_x, y, x + size_x - radius, y, radius);
	ctx.arcTo(x, y, x, y + radius, radius);
	ctx.fill();
};


const handleKeyUp = useCallback((event: KeyboardEvent) => {
	// const moveUp = async () => {
		//   try {
			//     await axios.post('/game/move/up/disable');
			//     console.log('moveUpDisable');
	//   } catch (error) {
	//     console.error('Failed to stop moving the paddle up:', error);
	//   }
	// };
	
	// if (event.key === 'ArrowUp') {
		//   moveUp();
		// }
		const stopPressUp = async () => {
			try {
				await axios.post('/game/move/stopup');
				console.log('stopMoveUp');
			} catch (error) {
				console.error('Failed to stop moving the paddle up:', error);
			}
		};
		const stopPressDown = async () => {
			try {
				await axios.post('/game/move/stopdown');
				console.log('stopMoveDown');
			} catch (error) {
				console.error('Failed to stop moving the paddle down:', error);
			}
		};
		if (event.key === 'ArrowUp') {
		stopPressUp();
		setArrowUp(false);
	}
	if (event.key === 'ArrowDown') {
		stopPressDown();
		setArrowDown(false);
	}
}, []);

const handleKeyDown = useCallback((event: KeyboardEvent) => {
	const moveUp = async () => {
		try {
			await axios.post('/game/move/up/enable');
			console.log('moveUpEnable');
		} catch (error) {
			console.error('Failed to move the paddle up:', error);
		}
	};
	
	const moveDown = async () => {
		try {
			await axios.post('/game/move/down');
		console.log('moveDown');
	} catch (error) {
		console.error('Failed to move the paddle down:', error);
	}
};

const abTimeWarp = async () => {
	try {
		await axios.post('/game/ability/timewarp');
		console.log('timeWarp');
	} catch (error) {
		console.error('Failed to use timewarp ability:', error);
	}
};

const abMirage = async () => {
	try {
		await axios.post('/game/ability/mirage');
		console.log('mirage');
	} catch (error) {
		console.error('Failed to use mirage ability:', error);
	}
};

const ultScorpion = async () => {
	try {
		await axios.post('/game/ultScorpion');
		console.log('ultScorpion');
	} catch (error) {
		console.error('Failed to use scorpion ability:', error);
	}
};

const ultSubZero = async () => {
	try {
		await axios.post('/game/ultSubZero');
		console.log('ultSubZero');
	} catch (error) {
		console.error('Failed to use sub zero ability', error);
	}
};

const abFreeze = async () => {
	try {
		await axios.post('/game/ability/freeze');
		console.log('abFreeze');
	} catch (error) {
		console.error('Failed to use freeze ability', error);
	}
};

const abLightning = async () => {
	try {
		await axios.post('/game/ability/lightning');
		console.log('abLightning');
	} catch (error) {
		console.error('Failed to use lightning ability', error);
	}
};

	const soundGrenade = async () => {
		try {
			await axios.post('/game/ability/soundgrenade');
			console.log('soundGrenade');
		} catch (error) {
			console.error('Failed to use soundGrenade ability:', error);
		}
	};
	
	const BallSize = async () => {
		try {
			await axios.post('/game/ability/ballsize');
			console.log('BallSize');
		} catch (error) {
			console.error('Failed to use BallSize ability:', error);
		}
	};
	
	const ballReset = async () => {
		try {
			await axios.post('/game/ability/ballreset');
			console.log('ballreset');
		} catch (error) {
			console.error('Failed to use ballreset ability:', error);
		}
	};
	
	const ballSpeed = async () => {
		try {
			await axios.post('/game/ability/ballspeed');
			console.log('ballspeed');
		} catch (error) {
		console.error('Failed to use ballspeed ability:', error);
	}
};

if (event.key === 'ArrowUp' && !arrowUp) {
		setArrowUp(true);
		moveUp();
	} else if (event.key === 'ArrowDown' && !arrowDown) {
		setArrowDown(true);
		moveDown();
	} else if (event.key === 'z') {
		const sound = new Audio(GetOverHere);
		sound.play();
		ultScorpion();
	} else if (event.key === 'x') {
		soundGrenade();
	} else if (event.key === 'c') {
		BallSize();
	} else if (event.key === 'r') {
		ballReset();
	} else if (event.key === 'v') {
		ballReset();
	} else if (event.key === 'b') {
		ultSubZero();
	} else if (event.key === 't') {
		abTimeWarp();
	} else if (event.key === 'm') {
		abMirage();
	} else if (event.key === 'n') {
		abFreeze();
	} else if (event.key === 'l') {
		abLightning();
	}
}, [arrowDown, arrowUp]);

// const handleKeyUp = useCallback((event: KeyboardEvent) => {
	//   const moveUp = async () => {
		//     try {
			//       await axios.post('/game/move/up/disable');
			//       console.log('moveUpDisable');
			//     } catch (error) {
				//       console.error('Failed to stop moving the paddle up:', error);
				//     }
				//   };
				
				//   if (event.key === 'ArrowUp') {
					//     moveUp();
//   }
// }, []);

useEffect(() => {
	socket.current = io('http://localhost:8002');
	return () => {
		if (socket.current) {
			socket.current.disconnect();
			}
	};
}, []);

useEffect(() => {
	if (socket.current) {
		socket.current.on('ballUpdate', (event: any) => {
			const { ball } = event;
			setBallPosition(ball);
			});
			socket.current.on('scoreUpdate', (event: any) => {
				const { score } = event;
		setScore(score);
	});
	socket.current.on('player1Update', (event: any) => {
		const { player1 } = event;
		setPlayer1Position(player1);
	});
	socket.current.on('player2Update', (event: any) => {
		const { player2 } = event;
		setPlayer2Position(player2);
	});
	socket.current.on('ultimateUpdate', (event: any) => {
		const { ultimate } = event;
		setUlitimate(ultimate);
	});
	socket.current.on('winnerUpdate', (event: any) => {
		const { winner } = event;
		setWinner(winner);
	});
	socket.current.on('SoundGrenade', (event: any) => {
		const sound = new Audio(SoundGrenade);
		sound.play();
	});
	socket.current.on('BallSize', (event: any) => {
		const { ballSize } = event;
		setBallSize(ballSize)
	});
	socket.current.on('gameStatus', (event: any) => {
		const { gameStatus } = event;
		setGameStarted(gameStatus);
	});
	socket.current.on('ultimateSubZero', (event: any) => {
		const { ultimate } = event;
		setSubZeroUlt(ultimate);
	});
	socket.current.on('mirage', (event: any) => {
		const { mirage } = event;
		setMirage(mirage);
	});
	socket.current.on('mirageUpdate', (event: any) => {
		const { mirageUpdate } = event;
		setMiragePos(mirageUpdate);
	});
	socket.current.on('freeze', (event: any) => {
		const { freeze } = event;
		setFreeze(freeze);
	});
	socket.current.on('lightning', (event: any) => {
		const { lightning } = event;
		setLightning(lightning);
	});
	}
}, []);  

const gameStatus = async () => {
	try {
		await axios.get('/game/gameStatus');
		// console.log('gameStatus');
	} catch (error) {
		console.error('Get gameStatus failed', error);
	}
};

	useEffect(() => {
		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('keyup', handleKeyUp);
	if (!isGameStarted) {
	canvas?.addEventListener("click", handleMouseClick);
	canvas?.addEventListener("mousemove", handleMouseMove);
	}
		return () => {
	if (!isGameStarted) {
		canvas?.removeEventListener("click", handleMouseClick);
		canvas?.removeEventListener("mousemove", handleMouseMove);
	}
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('keyup', handleKeyUp);
		}
	}, [canvas, handleMouseClick, handleMouseMove, handleKeyUp, handleKeyDown, isGameStarted]);

	// useEffect(() => {
	// 	setRender(true);
	// }, []);

	// useEffect(() => {
	// 	const handlePageReload = () => {
	// 		setRender(true);
	// 	  console.log('Page is being reloaded');
	// 	};
	
	// 	window.addEventListener('beforeunload', handlePageReload);
	
	// 	return () => {
	// 	  window.removeEventListener('beforeunload', handlePageReload);
	// 	};
	//   }, []);

useEffect(() => {
	setRender(false);
	// const canvas = canvasRef.current;
	if (canvas) {
		if (ctx) {
			if (!isGameStarted) {
				ctx.globalAlpha = 1;
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.fillStyle = backgroundColor;
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				ctx.font = '40px Arial'; //ITC Zapf Chancery
				ctx.fillStyle = 'white';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';


				
				ctx.fillText(`Gamemode`, canvas.width / 2, 30);
				ctx.fillText(`Paddle`, canvas.width / 2, 180);
				ctx.fillText(`Character`, canvas.width / 2, 330);



				for (var index in gamemodeButtons) {
					drawButton(ctx, gamemodeButtons[index], selectedGamemode);
				}
				for (index in paddleButtons) {
					drawImages(ctx, paddleButtons[index], selectedPaddle);
				}
				for (index in characterButtons) {
					drawImages(ctx, characterButtons[index], selectedCharacter);
				}
			}
		if (isGameStarted)
		{
		//   console.log("game started.");
		// Draw paddles
		// ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = backgroundColor;
		if (lightning) {
			ctx.fillRect(10, player1Position - 10, 20, 120);
			ctx.globalAlpha = 0.1;
		}
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = 'white';
		ctx.globalAlpha = 1;
		//   ctx.fillRect(10, player1Position, 20, 100);
		//   ctx.fillRect(770, player2Position, 20, 100);
		//   paddle_s.addEventListener('load', () => {
		// 	console.log("load scorpion");
		// });
		ctx.drawImage(paddle_s, 10, player1Position);
	if (freeze) {
		ctx.globalAlpha = 0.50;
		ctx.drawImage(iceBlock, player1Position - 10, 5, player1Position + 20, 15);
		ctx.globalAlpha = 1;
	}
		//   paddle_sub.addEventListener('load', () => {
		// 	console.log("load subzero");
		// });
		ctx.drawImage(paddle_sub, 770, player2Position);
		
		// Draw the ball
		ctx.fillStyle = 'white';
		ctx.beginPath();
		ctx.arc(ballPosition.x, ballPosition.y, ballSize, 0, Math.PI * 2);
		ctx.fill();
		if (lightning) {
			ctx.globalAlpha = 0.7;
			ctx.fillStyle = 'rgb(255, 188, 0)';
			ctx.strokeStyle = 'rgb(255, 188, 0)';
			ctx.beginPath();
			ctx.arc(ballPosition.x, ballPosition.y, ballSize, 0, Math.PI * 2);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(ballPosition.x, ballPosition.y, ballSize + 12, 0, Math.PI * 2);
			ctx.stroke();
		}
		if (subZeroUlt) {
			// iceBlock.addEventListener('error', () => {
			// 	console.log("load scorpion ERROR");
			//   });
			//   iceBlock.addEventListener('load', () => {
			// 	  console.log("load scorpion");
			// 	});
				ctx.globalAlpha = 0.50;
				ctx.drawImage(iceBlock, ballPosition.x - ballSize - 10, ballPosition.y - ballSize - 10, ballSize*2 + 20, ballSize*2 + 20);
				ctx.globalAlpha = 1;
		}
		
		// Draw the line to the ball, when scorpion ability is used
		if (ultimate) {
			// Draw a line between two points
			ctx.beginPath();
			ctx.moveTo(30, player1Position + 50); // Move to the first point
			ctx.lineTo(ballPosition.x, ballPosition.y); // Draw a line to the second point
			ctx.strokeStyle = 'white';
			ctx.lineWidth = 3;
			ctx.stroke();
			ctx.closePath();
		}

		if (mirage) {
			ctx.globalAlpha = 0.65;
			for (var i in miragePos) {
				ctx.beginPath();
				ctx.arc(miragePos[i][0], miragePos[i][1], ballSize, 0, Math.PI * 2);
				ctx.fill();
				ctx.closePath();
			}
			ctx.globalAlpha = 1;
		}
		
		// Draw score
		ctx.font = '30px Arial';
		ctx.fillStyle = 'white';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(`${score.p1} - ${score.p2}`, canvas.width / 2, 30);
		ctx.font = '40px Arial';
		ctx.fillText(`${winner}`, canvas.width / 2, canvas.height - 50);
		}
	}
	}
}, [render, setRender, player1Position, player2Position, ballPosition, ultimate, score, winner, ballSize, drawButton, isGameStarted, gamemodeButtons, canvas, ctx, handleMouseMove, subZeroUlt, iceBlock, paddle_s, paddle_sub, mirage, miragePos, paddleButtons, selectedGamemode, selectedPaddle, freeze, characterButtons, selectedCharacter, drawImages, lightning]);



return (
	<div>
	<canvas ref={canvasRef} width={1200} height={800} style={{ backgroundColor: 'black', marginRight: '50' }}></canvas>
	<div>
		<button onClick={handleStartGame}>
		Start Game
		</button>
		<button onClick={handleStopGame}>
		Stop Game
		</button>
	</div>
	</div>
);
};

export default GameComponent;
