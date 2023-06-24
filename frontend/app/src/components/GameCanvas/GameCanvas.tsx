import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import io, { Socket } from "socket.io-client"
import { Button, Options } from './Canvas'
import GetOverHere from '../../sounds/getOverHere.mp3'
import SoundGrenade from '../../sounds/Sound_Grenade.mp3'
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
import paddle_scorpion from '../../images/scorpion_paddle.png'
import paddle_subzero from '../../images/subzero_paddle.png'
import paddle_BigSubZero from '../../images/BigSubZero.png'
import paddle_SmallSubZero from '../../images/SmallSubZero.png'
import paddle_BigScorpion from '../../images/BigScorpion.png'
import paddle_SmallScorpion from '../../images/SmallScorpion.png'
import masterLogo from '../../images/logo.png'
import SubZeroSpecialImage from '../../images/Abilities/SubZeroSpecial.png'
import RaidenSpecialImage from '../../images/Abilities/RaidenSpecial.png'
import ScorpionSpecialImage from '../../images/Abilities/ScorpionSpecial.png'
import MirageAbilityImage from '../../images/Abilities/MirageAbility.png'
import FreezeAbilityImage from '../../images/Abilities/FreezeAbility.png'
import BiggerBallAbilityImage from '../../images/Abilities/BiggerBallAbility.png'
import SmallerBallAbilityImage from '../../images/Abilities/SmallerBallAbility.png'
import SoundGrenadeAbilityImage from '../../images/Abilities/SoundGrenadeAbility.png'
import { Mode } from './enums/Modes';
import { Paddles } from './enums/Paddles';
import { Character } from './enums/Characters';

axios.defaults.baseURL = 'http://localhost:3333';

type GameComponentProps = {};

const GameComponent: React.FC<GameComponentProps> = () => {

	function createImage(src: string) {
		var img = new Image();
		img.src = src;
		return img;
	}
	const paddle_s				= useMemo(() => createImage(paddle_scorpion), []);
	const paddle_bigs			= useMemo(() => createImage(paddle_BigScorpion), []);
	const paddle_smalls			= useMemo(() => createImage(paddle_SmallScorpion), []);
	const paddle_sub			= useMemo(() => createImage(paddle_subzero), []);
	const paddle_bigsub			= useMemo(() => createImage(paddle_BigSubZero), []);
	const paddle_smallsub		= useMemo(() => createImage(paddle_SmallSubZero), []);
	const iceBlock				= useMemo(() => createImage(ice_block), []);
	const paddle_small			= useMemo(() => createImage(small_paddle), []);
	const paddle_regular		= useMemo(() => createImage(regular_paddle), []);
	const paddle_big			= useMemo(() => createImage(big_paddle), []);
	const left_bar				= useMemo(() => createImage(left_empty), []);
	const mid_bar				= useMemo(() => createImage(mid_empty), []);
	const right_bar				= useMemo(() => createImage(right_empty), []);
	const left_health			= useMemo(() => createImage(left_full), []);
	const mid_health			= useMemo(() => createImage(mid_full), []);
	const right_health			= useMemo(() => createImage(right_full), []);
	const iconBackground		= useMemo(() => createImage(icon_Background), []);
	const icon					= useMemo(() => createImage(icon_Symbol), []);
	const healthText			= useMemo(() => createImage(health_text), []);
	const logo					= useMemo(() => createImage(masterLogo), []);
	const SubZeroSpecial		= useMemo(() => createImage(SubZeroSpecialImage), []);
	const RaidenSpecial			= useMemo(() => createImage(RaidenSpecialImage), []);
	const ScorpionSpecial		= useMemo(() => createImage(ScorpionSpecialImage), []);
	const MirageAbility			= useMemo(() => createImage(MirageAbilityImage), []);
	const FreezeAbility			= useMemo(() => createImage(FreezeAbilityImage), []);
	const BiggerBallAbility		= useMemo(() => createImage(BiggerBallAbilityImage), []);
	const SmallerBallAbility	= useMemo(() => createImage(SmallerBallAbilityImage), []);
	const SoundGrenadeAbility	= useMemo(() => createImage(SoundGrenadeAbilityImage), []);
	const scorpionSpecialSound 	= useMemo(() => new Audio(GetOverHere), []);
	const soundGrenadeSound 	= useMemo(() => new Audio(SoundGrenade), []);

	const [player, setPlayer] = useState<number>();
	const [player1Size, setPlayer1Size] = useState<{width: number, height: number}>({ width: 20, height: 100});
	const [player2Size, setPlayer2Size] = useState<{width: number, height: number}>({ width: 20, height: 100});
	const [player1Position, setPlayer1Position] = useState<number>(250);
	const [player2Position, setPlayer2Position] = useState<number>(250);
	const [player1Character, setPlayer1Character] = useState<HTMLImageElement>(new Image());
	const [player2Character, setPlayer2Character] = useState<HTMLImageElement>(new Image());
	const [playerAbility, setPlayerAbility] = useState<HTMLImageElement>(new Image());
	const [playerUlt, setPlayerUlt] = useState<HTMLImageElement>(new Image());
	const [ballPosition, setBallPosition] = useState<{ x: number; y: number }>({ x: 400, y: 300 });
	const [ballSize, setBallSize] = useState<number>(15);
	const [isGameStarted, setGameStarted] = useState<boolean>(false);
	const [winner, setWinner] = useState<string>("");
	const [score, setScore] = useState<{ p1: number; p2: number }>({ p1: 0, p2: 0 });
	const [arrowDown, setArrowDown] = useState<boolean>(false);
	const [arrowUp, setArrowUp] = useState<boolean>(false);
	const [abilities, setAbilities] = useState<boolean>(false);
	const [hasAbility, setHasAbility] = useState<boolean>(true);
	const [hasUlt, setHasUlt] = useState<boolean>(true);

	const [secondsLeft, setSecondsLeft] = useState<number>(15);
	const [secondsLeftUlt, setSecondsLeftUlt] = useState<number>(15);

	// Character special abilities
	const [scorpionSpecial, setScorpionSpecial] = useState<boolean>(false);
	const [scorpionTarget, setScorpionTarget] = useState<number>();
	const [subZeroSpecial, setSubZeroSpecial] = useState<boolean>(false);
	const [subZeroTarget, setSubZeroTarget] = useState<number>();
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

	const [selectedGamemode, setSelectedGamemode] = useState<number>(-1);
	const [selectedPaddle, setSelectedPaddle] = useState<number>(-1);
	const [selectedCharacter, setSelectedCharacter] = useState<number>(-1);
	const [render, setRender] = useState<boolean>(false);

	const backgroundColor = "rgb(100, 100, 100)"

	const gamemodeButtons = useMemo(() => {
		var Singleplayer:Button = new Button("Singleplayer", Mode.Singleplayer, {x:200, y:50}, {x:30, y:70});
		var MasterOfPong:Button = new Button("Master Of Pong", Mode.MasterOfPong, {x:200, y:50}, {x:300, y:70});
		var RegularPong:Button = new Button("Regular", Mode.Regular, {x:200, y:50}, {x:570, y:70});
		var GameStart:Button = new Button("Start Game", Mode.Start, {x: 200, y:50}, {x:300, y:500});
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
		var SmallPaddle:Button = new Button("Small", Paddles.Small, {x:200, y:50}, {x:30, y:190});
		var RegularPaddle:Button = new Button("Average Joe", Paddles.AverageJoe, {x:200, y:50}, {x:300, y:190});
		var BigPaddle:Button = new Button("Big Pete", Paddles.BigPete, {x:200, y:50}, {x:570, y:190});
		if (canvas)
		{
			console.log("Scaling the buttons");
			SmallPaddle.setSizeLocation({x:200 * canvas.width / 800, y:100 * canvas.height / 600}, {x:30 * canvas.width / 800, y:190 * canvas.height / 600});
			RegularPaddle.setSizeLocation({x:200 * canvas.width / 800, y:100 * canvas.height / 600}, {x:300 * canvas.width / 800, y:190 * canvas.height / 600});
			BigPaddle.setSizeLocation({x:200 * canvas.width / 800, y:100 * canvas.height / 600}, {x:570 * canvas.width / 800, y:190 * canvas.height / 600});
		}
		return [SmallPaddle, RegularPaddle, BigPaddle];
	}, [canvas]);

	const characterButtons = useMemo(() => {
		var Scorpion:Button = new Button("Scorpion", Character.Scorpion, {x:20, y:100}, {x:30, y:360});
		var SubZero:Button = new Button("SubZero", Character.SubZero, {x:20, y:100}, {x:300, y:360});
		if (canvas)
		{
			Scorpion.setSizeLocation({x:20 * canvas.width / 800, y:100 * canvas.height / 600}, {x:30 * canvas.width / 800, y:360 * canvas.height / 600});
			SubZero.setSizeLocation({x:20 * canvas.width / 800, y:100 * canvas.height / 600}, {x:300 * canvas.width / 800, y:360 * canvas.height / 600});
		}
		return [Scorpion, SubZero];
	}, [canvas]);

	const handleStartGame = useCallback(() => {
		try {
			//await axios.post('/game/start');
			var opt = new Options(selectedGamemode, selectedPaddle, selectedCharacter);
			console.log('Socket:', socket.current);
			socket.current?.emit('start', opt);
		} catch (error) {
		console.error('Failed to start the game:', error);
		}
	}, [selectedCharacter, selectedGamemode, selectedPaddle]);

	const handleStopGame = async () => {
		setGameStarted(false);
		try {
			await axios.post('/game/stop');
		} catch (error) {
			console.error('Failed to stop the game:', error);
		}
	};

	const drawButton = useCallback((ctx: CanvasRenderingContext2D, button: Button, selected: number) => {
		const { coordinates, size, isFocused, selected: buttonSelected } = button;
		const { x, y } = coordinates;
		const { x: width, y: height } = size;
		const isButtonSelected = selected > -1 && !buttonSelected;

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

	const drawImages = useCallback((ctx: CanvasRenderingContext2D, button: Button, selected: number = 0) => {
		var image: HTMLImageElement;
		switch (button.id) {
			case Paddles.Small:
				image = paddle_small;
				break;
			case Paddles.AverageJoe:
				image = paddle_regular;
				break;
			case Paddles.BigPete:
				image = paddle_big;
				break;
			case Character.Scorpion:
				image = paddle_s;
				break;
			default:
				image = paddle_sub;
		}
		ctx.fillStyle = backgroundColor;
		ctx.fillRect(button.coordinates.x, button.coordinates.y, button.size.x, button.size.y);
		ctx.drawImage(image, button.coordinates.x, button.coordinates.y, button.size.x, button.size.y);
		if (!button.isFocused && !button.selected && selected === -1) {
			ctx.drawImage(image, button.coordinates.x, button.coordinates.y, button.size.x, button.size.y);
			ctx.globalAlpha=.25;
			ctx.fillStyle="black";
			roundedRect(ctx, button.coordinates.x, button.coordinates.y, button.size.x, button.size.y, 10);
			ctx.globalAlpha=1;
		}
		if (selected > -1 && !button.selected) {
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
					if (selectedGamemode !== -1 && selectedPaddle !== -1 && selectedCharacter !== -1) {
						if (selectedGamemode !== Mode.Regular) {
							setAbilities(true);
							switch (selectedCharacter) {
								case Character.Scorpion:
									setPlayerUlt(ScorpionSpecial);
									break;
								case Character.SubZero:
									setPlayerUlt(SubZeroSpecial);
									break;
								case Character.Raiden:
									setPlayerUlt(RaidenSpecial);
									break;
							}
						}
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
				else if (selectedGamemode !== -1) {
					if (gamemodeButtons[index].selected) {
						gamemodeButtons[index].selected = false;
						setSelectedGamemode(-1);
					}
					else {
						for (var button in gamemodeButtons) {
							if (gamemodeButtons[button].selected) {
								gamemodeButtons[button].selected = false;
								gamemodeButtons[index].selected = true;
								setSelectedGamemode(gamemodeButtons[index].id);
							}
						}
					}
				}
				else {
					setSelectedGamemode(gamemodeButtons[index].id);
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
				if (selectedPaddle !== -1) {
					if (paddleButtons[index].selected) {
						paddleButtons[index].selected = false;
						setSelectedPaddle(-1);
					}
					else {
						for (button in paddleButtons) {
							if (paddleButtons[button].selected) {
								paddleButtons[button].selected = false;
								paddleButtons[index].selected = true;
								setSelectedPaddle(paddleButtons[index].id);
							}
						}
					}
				}
				else {
					setSelectedPaddle(paddleButtons[index].id);
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
				if (selectedCharacter !== -1) {
					if (characterButtons[index].selected) {
						characterButtons[index].selected = false;
						setSelectedCharacter(-1);
					}
					else {
						for (button in characterButtons) {
							if (characterButtons[button].selected) {
								characterButtons[button].selected = false;
								characterButtons[index].selected = true;
								setSelectedCharacter(characterButtons[index].id - 7);
							}
						}
					}
				}
				else {
					setSelectedCharacter(characterButtons[index].id);
					characterButtons[index].selected = true;
				}
				for (toDraw in characterButtons) {
					drawImages(ctx, characterButtons[toDraw], selectedCharacter);
				}
				return;
			}
		}
	}, [canvas, drawButton, ctx, gamemodeButtons, paddleButtons, handleMouseMove, selectedGamemode, selectedPaddle, characterButtons, selectedCharacter, drawImages, handleStartGame, RaidenSpecial, SubZeroSpecial, ScorpionSpecial]);
	

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
				socket.current?.emit('moveUpDisable');
				// await axios.post('/game/move/stopup');
				console.log('stopMoveUp');
			} catch (error) {
				console.error('Failed to stop moving the paddle up:', error);
			}
		};
		const stopPressDown = async () => {
			try {
				socket.current?.emit('moveDownDisable');
				// await axios.post('/game/move/stopdown');
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
				if (abilityName === "ScorpionSpecial" ||( abilityName === "Special Ability" && selectedCharacter === Character.Scorpion && hasUlt)) {
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
				socket.current?.emit('moveUpEnable');
				// await axios.post('/game/move/up/enable');
				console.log('moveUpEnable');
			} catch (error) {
				console.error('Failed to move the paddle up:', error);
			}
		};
	
		const moveDown = async () => {
			try {
				socket.current?.emit('moveDownEnable');
				// await axios.post('/game/move/down');
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
		else if (event.key === 's')
			socket.current?.emit('randomAbility');
		else if (event.key === 'a')
			socket.current?.emit('specialAbility');
			//executeAbility("Special Ability", "special")

		
	
	}, [arrowDown, arrowUp, abilities, selectedCharacter, hasUlt]);

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
				console.log("Got the ball position update");
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
				socket.current.on('secondsLeft', (event: any) => {
					const { secondsLeft } = event;
					setSecondsLeft(secondsLeft);
				});
				socket.current.on('secondsLeftUlt', (event: any) => {
					const { secondsLeftUlt } = event;
					setSecondsLeftUlt(secondsLeftUlt);
				});
				socket.current.on('ScorpionSpecial', (event: any) => {
					const { ScorpionSpecial, target } = event;
					setScorpionSpecial(ScorpionSpecial);
					setScorpionTarget(target);
					scorpionSpecialSound.play();
				});
				socket.current.on('SubZeroSpecial', (event: any) => {
					const { SubZeroSpecial, target } = event;
					setSubZeroSpecial(SubZeroSpecial);
					setSubZeroTarget(target);
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
					soundGrenadeSound.play();
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
					const { hasAbility, ability } = event;
					setHasAbility(hasAbility);
					setSecondsLeft(15);
					switch(ability) {
						case 0:
							setPlayerAbility(SmallerBallAbility);
							break;
						case 1:
							setPlayerAbility(FreezeAbility);
							break;
						case 2:
							setPlayerAbility(SoundGrenadeAbility);
							break;
						case 3:
							setPlayerAbility(BiggerBallAbility);
							break;
						case 4:
							setPlayerAbility(MirageAbility);
							break;
						case 5:
							break;
					}
				});
				socket.current.on('hasUlt', (event: any) => {
					const { hasUlt } = event;
					setHasUlt(hasUlt);
					setSecondsLeftUlt(15);
				});
				socket.current.on('playerCharacter', (event: any) => {
					const { player1Character, player1Size, player2Character, player2Size } = event;
					switch (player2Character) {
						case Character.Scorpion:
							switch (player2Size) {
								case Paddles.Small:
									setPlayer2Character(paddle_smalls);
									setPlayer2Size({width: 10, height: 50});
									break;
								case Paddles.AverageJoe:
									setPlayer2Character(paddle_s);
									setPlayer2Size({width: 20, height: 100});
									break;
								case Paddles.BigPete:
									setPlayer2Character(paddle_bigs);
									setPlayer2Size({width: 32, height: 160});
									break;
							}
							break;
						case Character.SubZero:
							switch (player2Size) {
								case Paddles.Small:
									setPlayer2Character(paddle_smallsub);
									setPlayer2Size({width: 10, height: 50});
									break;
								case Paddles.AverageJoe:
									setPlayer2Character(paddle_sub);
									setPlayer2Size({width: 20, height: 100});
									break;
								case Paddles.BigPete:
									setPlayer2Character(paddle_bigsub);
									setPlayer2Size({width: 32, height: 160});
									break;
							}
							break;	
						case Character.Raiden:
							switch (player2Size) {

							}
					}		
					switch (player1Character) {
						case Character.Scorpion:
							switch (player1Size) {
								case Paddles.Small:
									setPlayer1Character(paddle_smalls);
									setPlayer1Size({width: 10, height: 50});
									break;
								case Paddles.AverageJoe:
									setPlayer1Character(paddle_s);
									setPlayer1Size({width: 20, height: 100});
									break;
								case Paddles.BigPete:
									setPlayer1Character(paddle_bigs);
									setPlayer1Size({width: 32, height: 160});
									break;
							}
							break;
						case Character.SubZero:
							switch (player1Size) {
								case Paddles.Small:
									setPlayer1Character(paddle_smallsub);
									setPlayer1Size({width: 10, height: 50});
									break;
								case Paddles.AverageJoe:
									setPlayer1Character(paddle_sub);
									setPlayer1Size({width: 20, height: 100});
									break;
								case Paddles.BigPete:
									setPlayer1Character(paddle_bigsub);
									setPlayer1Size({width: 32, height: 160});
									break;
							}
							break;	
						case Character.Raiden:
							switch (player1Size) {

							}
					}
				});
				socket.current.on('player', (event: any) => {
					const { player } = event;
					setPlayer(player);
					console.log("this player number: " + player);
				});
			}
		}
	}, [abilities, hasAbility, paddle_s, paddle_sub, paddle_bigs, paddle_smalls, paddle_bigsub, paddle_smallsub, BiggerBallAbility, MirageAbility, SmallerBallAbility, FreezeAbility, SoundGrenadeAbility, player, scorpionSpecialSound, soundGrenadeSound]);

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

					ctx.fillText(`Gamemode`, canvas.width / 2, 50);
					ctx.fillText(`Paddle`, canvas.width / 2, 210);
					ctx.fillText(`Character`, canvas.width / 2, 440);

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
					if (selectedGamemode !== Mode.Regular) {
						ctx.drawImage(player1Character, 10, player1Position);
						ctx.drawImage(player2Character, 1170, player2Position);
						if (hasUlt)
							ctx.drawImage(playerUlt, 100, 700, 50, 50);
						else {
							ctx.font = '35px Arial';
							ctx.fillText(`${secondsLeftUlt}`, 120, 725);
						}
						if (hasAbility)
							ctx.drawImage(playerAbility, 150, 700, 50, 50);
						else {
							ctx.font = '35px Arial';
							ctx.fillText(`${secondsLeft}`, 170, 725);
						}
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


					if (subZeroSpecial) {
						ctx.globalAlpha = 0.50;
						if (subZeroTarget === 1)
							ctx.drawImage(iceBlock, 5, player1Position - 10, player1Size.width + 10, player1Size.height + 20);
						else if (subZeroTarget === 2)
							ctx.drawImage(iceBlock, 1165, player2Position - 10, player2Size.width + 10, player2Size.height + 20);
						ctx.globalAlpha = 1;
					}
			
					if (abilities) {
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
						if (abilityFreeze) {
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
							if (scorpionTarget === 1)
								ctx.moveTo(player1Size.width + 10, player1Position + player1Size.height / 2);
							else if (scorpionTarget === 2)
								ctx.moveTo(1170, player2Position + player2Size.height / 2);
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
	}, [render, player1Position, player2Position, ballPosition, scorpionSpecial, score, winner, ballSize, drawButton, isGameStarted, gamemodeButtons, canvas, ctx, handleMouseMove, subZeroSpecial, iceBlock, paddle_s, paddle_sub, abilityMirage, miragePos, paddleButtons, selectedGamemode, selectedPaddle, abilityFreeze, characterButtons, selectedCharacter, drawImages, raidenSpecial, abilities, hasAbility, healthText, icon, iconBackground, left_bar, left_health, mid_bar, mid_health, right_bar, right_health, player1Character, player2Character, secondsLeft, hasUlt, player1Size, playerAbility, playerUlt, secondsLeftUlt, player2Size.height, player2Size.width, subZeroTarget, scorpionTarget]);



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
