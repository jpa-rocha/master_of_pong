import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import io, { Socket } from "socket.io-client"
import { Button, Options } from './Canvas'
import GetOverHere from '../../sounds/getOverHere.mp3'
import SoundGrenade from '../../sounds/Sound_Grenade.mp3'
import paddle_scorpion from '../../images/scorpion_paddle.png'
import paddle_subzero from '../../images/subzero_paddle.png'
import big_paddle from "../../images/BigPaddle.png"
import regular_paddle from "../../images/RegularPaddle.png"
import small_paddle from "../../images/SmallPaddle.png"
import ice_block from '../../images/iceBlock.png'
import left_empty from '../../images/HealthBar/LeftEmpty.png'
import mid_empty from '../../images/HealthBar/MidEmpty.png'
import right_empty from '../../images/HealthBar/RightEmpty.png'
import left_full from '../../images/HealthBar/LeftFull.png'
import mid_full from '../../images/HealthBar/MidFull.png'
import right_full from '../../images/HealthBar/RightFull.png'
import icon_Background from '../../images/HealthBar/icon.png'
import icon_Symbol from '../../images/HealthBar/health.png'
import health_text from '../../images/HealthBar/healthText.png'
import masterLogo from '../../images/logo.png'

axios.defaults.baseURL = 'http://localhost:3333';

type GameComponentProps = {};

const GameComponent: React.FC<GameComponentProps> = () => {

	function createImage(src: string) {
		var img = new Image();
		img.src = src;
		return img;
	}
	const paddle_s			= useMemo(() => createImage(paddle_scorpion), []);
	const paddle_sub		= useMemo(() => createImage(paddle_subzero), []);
	const iceBlock			= useMemo(() => createImage(ice_block), []);
	const paddle_small		= useMemo(() => createImage(small_paddle), []);
	const paddle_regular	= useMemo(() => createImage(regular_paddle), []);
	const paddle_big		= useMemo(() => createImage(big_paddle), []);
	const left_bar			= useMemo(() => createImage(left_empty), []);
	const mid_bar			= useMemo(() => createImage(mid_empty), []);
	const right_bar			= useMemo(() => createImage(right_empty), []);
	const left_health		= useMemo(() => createImage(left_full), []);
	const mid_health		= useMemo(() => createImage(mid_full), []);
	const right_health		= useMemo(() => createImage(right_full), []);
	const iconBackground	= useMemo(() => createImage(icon_Background), []);
	const icon				= useMemo(() => createImage(icon_Symbol), []);
	const healthText		= useMemo(() => createImage(health_text), []);
	const logo				= useMemo(() => createImage(masterLogo), []);
	
	const [player1Position, setPlayer1Position] = useState<number>(250);
	const [player2Position, setPlayer2Position] = useState<number>(250);
	const [player1Character, setPlayer1Character] = useState<HTMLImageElement>(new Image());
	const [player2Character, setPlayer2Character] = useState<HTMLImageElement>(new Image());
	const [ballPosition, setBallPosition] = useState<{ x: number; y: number }>({ x: 400, y: 300 });
	const [ballSize, setBallSize] = useState<number>(15);
	const [isGameStarted, setGameStarted] = useState<boolean>(false);
	const [winner, setWinner] = useState<string>("");
	const [score, setScore] = useState<{ p1: number; p2: number }>({ p1: 0, p2: 0 });
	const [arrowDown, setArrowDown] = useState<boolean>(false);
	const [arrowUp, setArrowUp] = useState<boolean>(false);
	const [abilities, setAbilities] = useState<boolean>(false);
	const [hasAbility, setHasAbility] = useState<boolean>(true);

	// Character special abilities
	const [scorpionSpecial, setScorpionSpecial] = useState<boolean>(false);
	const [subZeroSpecial, setSubZeroSpecial] = useState<boolean>(false);
	const [raidenSpecial, setRaidenSpecial] = useState<boolean>(false);

	// Regular random abilities
	const [abilityFreeze, setAbilityFreeze] = useState<boolean>(false);
	const [abilityMirage, setAbilityMirage] = useState<boolean>(false);

	const [miragePos, setMiragePos] = useState([]);
	//   const [timeWarp, setTimeWarp] = useState<boolean>(false);

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const socket = useRef<Socket | null>(null);
	const canvas = canvasRef.current;
	const ctx = canvas?.getContext('2d');

	const [selectedGamemode, setSelectedGamemode] = useState<string>("");
	const [selectedPaddle, setSelectedPaddle] = useState<string>("");
	const [selectedCharacter, setSelectedCharacter] = useState<string>("");
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

	const drawButton = useCallback((ctx: CanvasRenderingContext2D, button: Button, selected: string = "") => {
		const { coordinates, size, isFocused, selected: buttonSelected } = button;
		const { x, y } = coordinates;
		const { x: width, y: height } = size;
		const isButtonSelected = selected.length > 0 && !buttonSelected;

		ctx.fillStyle = backgroundColor;
		ctx.fillRect(x, y, width, height);
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = 'white';
		roundedRect(ctx, x, y, width, height, 20);
		if (!isFocused && !buttonSelected && !isButtonSelected) {
			ctx.globalAlpha = 0.25;
			ctx.fillStyle = "black";
			roundedRect(ctx, x, y, width, height, 20);
			ctx.globalAlpha = 1;
		}
		ctx.font = '30px Arial';
		ctx.fillStyle = 'red';
		ctx.fillText(button.getName(), x + width / 2, y + height / 2);
		if (isButtonSelected) {
			ctx.globalAlpha = 0.4;
			ctx.fillStyle = "black";
			roundedRect(ctx, x, y, width, height, 20);
			ctx.globalAlpha = 1;
		}
	}, []);

	const drawImages = useCallback((ctx: CanvasRenderingContext2D, button: Button, selected: string = "") => {
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
		if (!button.isFocused && !button.selected && selected.length === 0) {
			ctx.drawImage(image, button.coordinates.x, button.coordinates.y, button.size.x, button.size.y);
			ctx.globalAlpha=.25;
			ctx.fillStyle="black";
			roundedRect(ctx, button.coordinates.x, button.coordinates.y, button.size.x, button.size.y, 10);
			ctx.globalAlpha=1;
		}
		if (selected.length > 0 && !button.selected) {
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
		const gameOptions = async () => {
			try {
				if (selectedGamemode !== "Regular Pong")
					setAbilities(true);
				else
					setAbilities(false);
				if (selectedCharacter === "Scorpion") {
					setPlayer1Character(paddle_s);
					// setPlayer2Character(paddle_sub);
				}
				else if (selectedCharacter === "SubZero") {
					setPlayer1Character(paddle_sub);
					// setPlayer2Character(paddle_s);
				}
				var opt = new Options(selectedGamemode, selectedPaddle, selectedCharacter);
				await axios.post('/game/options', opt);
				console.log('options');
			} catch (error) {
			console.error('Failed to send options:', error);
			}
		};
		for (var index in gamemodeButtons) {
			if (checkMouseOnButton(gamemodeButtons[index], e, canvas)) {
				if (gamemodeButtons[index].getName() === 'Start Game') {
					if (selectedGamemode.length !== 0 && selectedPaddle && selectedCharacter.length !== 0) {
						gameOptions();
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
				else if (selectedGamemode.length !== 0) {
					if (gamemodeButtons[index].selected) {
						gamemodeButtons[index].selected = false;
						setSelectedGamemode("");
					}
					else {
						for (var button in gamemodeButtons) {
							if (gamemodeButtons[button].selected) {
								gamemodeButtons[button].selected = false;
								gamemodeButtons[index].selected = true;
								setSelectedGamemode(gamemodeButtons[index].name);
							}
						}
					}
				}
				else {
					setSelectedGamemode(gamemodeButtons[index].name);
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
						paddleButtons[index].selected = false;
						setSelectedPaddle("");
					}
					else {
						for (button in paddleButtons) {
							if (paddleButtons[button].selected) {
								paddleButtons[button].selected = false;
								paddleButtons[index].selected = true;
								setSelectedPaddle(paddleButtons[index].name);
							}
						}
					}
				}
				else {
					setSelectedPaddle(paddleButtons[index].name);
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
				if (selectedCharacter.length !== 0) {
					if (characterButtons[index].selected) {
						characterButtons[index].selected = false;
						setSelectedCharacter("");
					}
					else {
						for (button in characterButtons) {
							if (characterButtons[button].selected) {
								characterButtons[button].selected = false;
								characterButtons[index].selected = true;
								setSelectedCharacter(characterButtons[index].name);
							}
						}
					}
				}
				else {
					setSelectedCharacter(characterButtons[index].name);
					characterButtons[index].selected = true;
				}
				for (toDraw in characterButtons) {
					drawImages(ctx, characterButtons[toDraw], selectedCharacter);
				}
				return;
			}
		}
	}, [canvas, drawButton, ctx, gamemodeButtons, paddleButtons, handleMouseMove, selectedGamemode, selectedPaddle, characterButtons, selectedCharacter, drawImages, paddle_s, paddle_sub]);
	

	function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, clear: boolean = false) {
		if (clear)
		ctx.fillStyle='rgba(0,0,0,0)';
		ctx.beginPath();
		ctx.moveTo(x, y + radius);
		ctx.arcTo(x, y + height, x + radius, y + height, radius);
		ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
		ctx.arcTo(x + width, y, x + width - radius, y, radius);
		ctx.arcTo(x, y, x, y + radius, radius);
		ctx.fill();
	};


	const handleKeyUp = useCallback((event: KeyboardEvent) => {
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

		const executeAbility = async (abilityName: string, endpoint: string) => {
			try {
				if (abilityName === "ScorpionSpecial") {
					const sound = new Audio(GetOverHere);
					sound.play();
				}
				await axios.post(`/game/ability/${endpoint}`);
				console.log(abilityName);
			} catch (error) {
				console.error(`Failed to use ${abilityName} ability:`, error);
			}
		}
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

		if (event.key === 'ArrowUp' && !arrowUp) {
			setArrowUp(true);
			moveUp();
		} 
		else if (event.key === 'ArrowDown' && !arrowDown) {
			setArrowDown(true);
			moveDown();
		} 
		else if (!abilities)
			return;
		else if (event.key === 'z')
			executeAbility("ScorpionSpecial", "Scorpion");
		else if (event.key === 'x')
			executeAbility("SubZeroSpecial", "SubZero");
		else if (event.key === 'c')
			executeAbility("RaidenSpecial", "Raiden");
 		else if (event.key === 'q')
			executeAbility("SoundGrenade", "soundgrenade");
		else if (event.key === 'v')
			executeAbility("BiggerBall", "biggerball");
		else if (event.key === 'b')
			executeAbility("SmallerBall", "smallerball");
		else if (event.key === 't')
			executeAbility("TimeWarp", "timewarp");
		else if (event.key === 'n')
			executeAbility("Freeze", "freeze");
		else if (event.key === 'm')
			executeAbility("Mirage", "mirage");
		else if (event.key === 'a')
			executeAbility("Random Ability", "random");
	
	}, [arrowDown, arrowUp, abilities]);

	useEffect(() => {
		socket.current = io('http://localhost:8002');
		if (render === false)
			setRender(true);
		else
			setRender(false);
		return () => {
			if (socket.current) {
				socket.current.disconnect();
			}
		};
	}, []);
	// !!!!! if we include the missing dependancies the canvas won't render on restart / refresh

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
			socket.current.on('winnerUpdate', (event: any) => {
				const { winner } = event;
				setWinner(winner);
			});
			socket.current.on('gameStatus', (event: any) => {
				const { gameStatus } = event;
				setGameStarted(gameStatus);
			});
			if (abilities) {
				// Character special abilities
				socket.current.on('ScorpionSpecial', (event: any) => {
					const { ScorpionSpecial } = event;
					setScorpionSpecial(ScorpionSpecial);
				});
				socket.current.on('SubZeroSpecial', (event: any) => {
					const { SubZeroSpecial } = event;
					setSubZeroSpecial(SubZeroSpecial);
				});
				socket.current.on('RaidenSpecial', (event: any) => {
					const { RaidenSpecial } = event;
					setRaidenSpecial(RaidenSpecial);
				});

				// random abilities / powerups
				socket.current.on('AbilityMirage', (event: any) => {
					const { AbilityMirage } = event;
					setAbilityMirage(AbilityMirage);
				});
				socket.current.on('SoundGrenade', (event: any) => {
					const sound = new Audio(SoundGrenade);
					sound.play();
				});
				socket.current.on('BallSize', (event: any) => {
					const { ballSize } = event;
					setBallSize(ballSize)
				});
				socket.current.on('mirageUpdate', (event: any) => {
					const { mirageUpdate } = event;
					setMiragePos(mirageUpdate);
				});
				socket.current.on('AbilityFreeze', (event: any) => {
					const { AbilityFreeze } = event;
					setAbilityFreeze(AbilityFreeze);
				});

				// checks for the game
				socket.current.on('hasAbility', (event: any) => {
					const { hasAbility } = event;
					setHasAbility(hasAbility);
				});
				socket.current.on('playerCharacter', (event: any) => {
					const { playerCharacter } = event;
					if (playerCharacter === "SubZero")
						setPlayer2Character(paddle_sub);
					else if (playerCharacter === "Scorpion")
					{
						setPlayer2Character(paddle_s);
						console.log("Set player 2 paddle to Scorpion");
					}
				});
			}
		}
	}, [abilities, hasAbility, paddle_s, paddle_sub]);

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

	useEffect(() => {
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
				if (isGameStarted) {
					ctx.fillStyle = backgroundColor;
					if (raidenSpecial) {
						ctx.fillRect(10, player1Position - 10, 20, 120);
						ctx.globalAlpha = 0.1;
					}
					ctx.fillRect(0, 0, canvas.width, canvas.height);
					ctx.fillStyle = 'white';
					ctx.globalAlpha = 1;
					if (selectedGamemode !== "Regular Pong") {
						ctx.drawImage(player1Character, 10, player1Position);
						ctx.drawImage(player2Character, 1170, player2Position);
					}	
					else {
						ctx.fillStyle = 'white';
						ctx.fillRect(10, player1Position, 20, 100);
						ctx.fillRect(1170, player2Position, 20, 100);

						ctx.strokeStyle = 'black';
						ctx.lineWidth = 2;
						ctx.strokeRect(10, player1Position, 20, 100);
						ctx.strokeRect(1170, player2Position, 20, 100);
					}


					if (abilityFreeze) {
						ctx.globalAlpha = 0.50;
						ctx.drawImage(iceBlock, 5, player1Position - 10, 30, 120);
						ctx.globalAlpha = 1;
					}
			
					if (abilities) {
						if (hasAbility) {
							ctx.font = '20px Arial';
							ctx.fillStyle = 'white';
							ctx.fillText(`Ability ready to use`, canvas.width / 2, 75);
						}
						else {
							ctx.font = '20px Arial';
							ctx.fillStyle = 'red';
							ctx.fillText(`Ability isn't ready yet`, canvas.width / 2, 75);
						}
						// p1 health border
						ctx.drawImage(healthText, 185, 60, 140, 25);
						ctx.font = '20px Arial';
						ctx.fillStyle = 'black';
						ctx.fillText(`Hp: ${11 - score.p2}`, 255, 75);
						ctx.drawImage(left_bar, 150, 25, 25, 40);
						ctx.drawImage(mid_bar, 175, 25, 25, 40);
						ctx.drawImage(mid_bar, 200, 25, 25, 40);
						ctx.drawImage(mid_bar, 225, 25, 26, 40);
						ctx.drawImage(mid_bar, 251, 25, 26, 40);
						ctx.drawImage(mid_bar, 277, 25, 26, 40);
						ctx.drawImage(right_bar, 303, 25, 25, 40);
						ctx.drawImage(iconBackground, 120, 25, 45, 45);
						ctx.drawImage(icon, 131, 38, 23, 20);
						// p2 health border
						ctx.drawImage(healthText, 875, 60, 140, 25);
						ctx.fillText(`Hp: ${11 - score.p1}`, 945, 75);
						ctx.drawImage(left_bar, 872, 25, 25, 40);
						ctx.drawImage(mid_bar, 897, 25, 26, 40);
						ctx.drawImage(mid_bar, 923, 25, 26, 40);
						ctx.drawImage(mid_bar, 949, 25, 26, 40);
						ctx.drawImage(mid_bar, 975, 25, 25, 40);
						ctx.drawImage(mid_bar, 1000, 25, 25, 40);
						ctx.drawImage(right_bar, 1025, 25, 25, 40);
						ctx.drawImage(iconBackground, 1035, 25, 45, 45);
						ctx.drawImage(icon, 1046, 38, 23, 20);
						var x = 0;
						// draw p1 health bars
						while (x < 11 - score.p2) {
							if (x === 0)
								ctx.drawImage(left_health, 151, 25, 25, 40);
							else if (x === 10)
								ctx.drawImage(right_health, 303, 25, 25, 40);
							else
								ctx.drawImage(mid_health, 163 + 14 * x, 25, 13, 40);
							x++;
						}			
						x = 0;
						// draw p2 health bars
						while (x < 11 - score.p1) {
								if (x === 0)
									ctx.drawImage(right_health, 1024, 25, 25, 40);
							else if (x === 10)
									ctx.drawImage(left_health, 872, 25, 25, 40);
							else
									ctx.drawImage(mid_health, 1024 - 14 * x, 25, 13, 40);
							x++;
						}

						// Draw the ball
						ctx.fillStyle = 'white';
						ctx.beginPath();
						ctx.arc(ballPosition.x, ballPosition.y, ballSize, 0, Math.PI * 2);
						ctx.fill();
						ctx.strokeStyle = 'black';
						ctx.beginPath();
						ctx.lineWidth = 2;
						ctx.arc(ballPosition.x, ballPosition.y, ballSize, -2, Math.PI * 2);
						ctx.stroke();
						ctx.fillStyle = 'white';

						if (raidenSpecial) {
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
						if (subZeroSpecial) {
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
						if (scorpionSpecial) {
							// Draw a line between two points
							ctx.beginPath();
							ctx.moveTo(30, player1Position + 50);
							ctx.lineTo(ballPosition.x, ballPosition.y);
							ctx.strokeStyle = 'white';
							ctx.lineWidth = 3;
							ctx.stroke();
							ctx.closePath();
							ctx.strokeStyle = 'black';
							ctx.lineWidth = 1;
						}
	
						if (abilityMirage) {
							ctx.globalAlpha = 0.65;
							for (var i in miragePos) {
								ctx.beginPath();
								ctx.arc(miragePos[i][0], miragePos[i][1], ballSize, 0, Math.PI * 2);
								ctx.fill();
								ctx.closePath();
							}
							ctx.globalAlpha = 1;
						}
					} else {
						ctx.font = '30px Arial';
						ctx.fillStyle = 'white';
						ctx.textAlign = 'center';
						ctx.textBaseline = 'middle';
						ctx.fillText(`${score.p1} - ${score.p2}`, canvas.width / 2, 30);
						ctx.font = '40px Arial';
						ctx.fillText(`${winner}`, canvas.width / 2, canvas.height - 50);

						// Draw the ball
						ctx.fillStyle = 'white';
						ctx.beginPath();
						ctx.arc(ballPosition.x, ballPosition.y, ballSize, 0, Math.PI * 2);
						ctx.fill();
						ctx.strokeStyle = 'black';
						ctx.beginPath();
						ctx.lineWidth = 2;
						ctx.arc(ballPosition.x, ballPosition.y, ballSize, -2, Math.PI * 2);
						ctx.stroke();
						ctx.fillStyle = 'white';
					}

				}
			}
		}
	}, [render, player1Position, player2Position, ballPosition, scorpionSpecial, score, winner, ballSize, drawButton, isGameStarted, gamemodeButtons, canvas, ctx, handleMouseMove, subZeroSpecial, iceBlock, paddle_s, paddle_sub, abilityMirage, miragePos, paddleButtons, selectedGamemode, selectedPaddle, abilityFreeze, characterButtons, selectedCharacter, drawImages, raidenSpecial, abilities, hasAbility, healthText, icon, iconBackground, left_bar, left_health, mid_bar, mid_health, right_bar, right_health, player1Character, player2Character]);



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
