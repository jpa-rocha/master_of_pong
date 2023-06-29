import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { Button, Options, ImageContainer } from './Canvas';
import GetOverHere from '../../sounds/getOverHere.mp3';
import IceSound from '../../sounds/IceSound.mp3';
import LightningSound from '../../sounds/LightningSound.mp3';
import SoundGrenade from '../../sounds/sound_grenade.mp3';
import { Mode } from './enums/Modes';
import { Paddles } from './enums/Paddles';
import { Character } from './enums/Characters';

axios.defaults.baseURL = 'http://localhost:3333';

type GameComponentProps = {};

const GameComponent: React.FC<GameComponentProps> = () => {
	const scorpionSpecialSound 	= useMemo(() => new Audio(GetOverHere), []);
	const subZeroSpecialSound 	= useMemo(() => new Audio(IceSound), []);
	const raidenSpecialSound 	= useMemo(() => new Audio(LightningSound), []);
	const soundGrenadeSound 	= useMemo(() => new Audio(SoundGrenade), []);

	const Images = useMemo(() => new ImageContainer(), []);
	const [player, setPlayer] = useState<number>();
	const [player1Size, setPlayer1Size] = useState<{width: number, height: number}>({ width: 20, height: 100});
	const [player2Size, setPlayer2Size] = useState<{width: number, height: number}>({ width: 20, height: 100});
	const [player1Position, setPlayer1Position] = useState<number>(350);
	const [player2Position, setPlayer2Position] = useState<number>(350);
	const [player1PositionX, setPlayer1PositionX] = useState<number>(10);
	const [player2PositionX, setPlayer2PositionX] = useState<number>(1170);
	const [player1Character, setPlayer1Character] = useState<HTMLImageElement>(new Image());
	const [player2Character, setPlayer2Character] = useState<HTMLImageElement>(new Image());
	const [playerAbility, setPlayerAbility] = useState<HTMLImageElement>(new Image());
	const [playerUlt, setPlayerUlt] = useState<HTMLImageElement>(new Image());
	const [ballPosition, setBallPosition] = useState<{ x: number; y: number }>({ x: 600, y: 400 });
	const [ballSize, setBallSize] = useState<number>(15);
	const [isGameSelection, setGameSelection] = useState<boolean>(true);
	const [isGameStarted, setGameStarted] = useState<boolean>(false);
	const [playerChose, setPlayerChose] = useState<boolean>(false);
	const [isPlayerWaiting, setPlayerWaiting] = useState<boolean>(false);
	const [isGameInit, setGameInit] = useState<boolean>(false);
	const [winner, setWinner] = useState<number>(-1);
	const [score, setScore] = useState<{ p1: number; p2: number }>({ p1: 0, p2: 0 });
	const [arrowDown, setArrowDown] = useState<boolean>(false);
	const [arrowUp, setArrowUp] = useState<boolean>(false);
	const [arrowLeft, setArrowLeft] = useState<boolean>(false);
	const [arrowRight, setArrowRight] = useState<boolean>(false);
	const [abilities, setAbilities] = useState<boolean>(false);
	const [hasAbility, setHasAbility] = useState<boolean>(true);
	const [hasUlt, setHasUlt] = useState<boolean>(true);

	const [secondsLeft, setSecondsLeft] = useState<number>(15);
	const [secondsLeftUlt, setSecondsLeftUlt] = useState<number>(15);
	const [abilityCooldownImage, setAbilityCooldownImage] = useState<HTMLImageElement>(new Image());
	const [ultimateCooldownImage, setUltimateCooldownImage] = useState<HTMLImageElement>(new Image());

	// Character special abilities
	const [scorpionSpecial, setScorpionSpecial] = useState<boolean>(false);
	const [scorpionTarget, setScorpionTarget] = useState<number>();
	const [player1Frozen, setPlayer1Frozen] = useState<boolean>();
	const [player2Frozen, setPlayer2Frozen] = useState<boolean>();
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
	const [regular, setRegular] = useState<boolean>(false);
	const [render, setRender] = useState<boolean>(false);

	const backgroundColor = "rgb(100, 100, 100)"

	const startButton = useMemo(() => {
		var GameStart:Button = new Button("Start Game", Mode.Start, {x: 200, y:50}, {x:300, y:500}, Images.buttonStart);
		if (canvas)
			GameStart.setSizeLocation({x:300 * canvas.width / 1200, y:75 * canvas.height / 800}, {x:450 * canvas.width / 1200, y:670 * canvas.height / 800});
		return GameStart;
	}, [canvas, Images.buttonStart]);

	const resetButton = useMemo(() => {
		var Reset:Button = new Button("Return to Game Menu", Mode.Reset, {x: 200, y:50}, {x:700, y:300}, Images.buttonMenu);
		if (canvas)
			Reset.setSizeLocation({x:150 * canvas.width / 1200, y:50 * canvas.height / 800}, {x:1040 * canvas.width / 1200, y:10 * canvas.height / 800});
		return Reset;
	}, [canvas, Images.buttonMenu]);

	const hyperButton = useMemo(() => {
		var Hyper:Button = new Button("Enable HyperMode", Mode.Hyper, {x: 15, y:15}, {x:385, y:475}, undefined);
		if (canvas)
			Hyper.setSizeLocation({x:25 * canvas.width / 1200, y:25 * canvas.height / 800}, {x:850 * canvas.width / 1200, y:695 * canvas.height / 800});
		return Hyper;
	}, [canvas]);

	const dodgeButton = useMemo(() => {
		var Dodge:Button = new Button("Grab life by the ball", Mode.Dodge, {x: 25, y:25}, {x:850, y:740}, undefined);
		if (canvas)
			Dodge.setSizeLocation({x:25 * canvas.width / 1200, y:25 * canvas.height / 800}, {x:850 * canvas.width / 1200, y:740 * canvas.height / 800});
		return Dodge;
	}, [canvas]);

	const gamemodeButtons = useMemo(() => {
		var Singleplayer:Button = new Button("Singleplayer", Mode.Singleplayer, {x:200, y:50}, {x:30, y:70}, Images.buttonModeSingle);
		var MasterOfPong:Button = new Button("Master Of Pong", Mode.MasterOfPong, {x:200, y:50}, {x:300, y:70}, Images.buttonModeMaster);
		var RegularPong:Button = new Button("Regular", Mode.Regular, {x:200, y:50}, {x:570, y:70}, Images.buttonModeRegular);
		if (canvas)
		{
			Singleplayer.setSizeLocation({x:300 * canvas.width / 1200, y:75 * canvas.height / 800}, {x:75 * canvas.width / 1200, y:100 * canvas.height / 800});
			MasterOfPong.setSizeLocation({x:300 * canvas.width / 1200, y:75 * canvas.height / 800}, {x:450 * canvas.width / 1200, y:100 * canvas.height / 800});
			RegularPong.setSizeLocation({x:300 * canvas.width / 1200, y:75 * canvas.height / 800}, {x:825 * canvas.width / 1200, y:100 * canvas.height / 800});
		}
		return [Singleplayer, MasterOfPong, RegularPong];
	}, [canvas, Images.buttonModeMaster, Images.buttonModeRegular, Images.buttonModeSingle]);

	const paddleButtons = useMemo(() => {
		var SmallPaddle:Button = new Button("Small", Paddles.Small, {x:200, y:50}, {x:30, y:190}, Images.buttonPaddleSmall);
		var RegularPaddle:Button = new Button("Average Joe", Paddles.AverageJoe, {x:200, y:50}, {x:300, y:190}, Images.buttonPaddleRegular);
		var BigPaddle:Button = new Button("Big Pete", Paddles.BigPete, {x:200, y:50}, {x:570, y:190}, Images.buttonPaddleBig);
		if (canvas)
		{
			SmallPaddle.setSizeLocation({x:300 * canvas.width / 1200, y:150 * canvas.height / 800}, {x:75 * canvas.width / 1200, y:260 * canvas.height / 800});
			RegularPaddle.setSizeLocation({x:300 * canvas.width / 1200, y:150 * canvas.height / 800}, {x:450 * canvas.width / 1200, y:260 * canvas.height / 800});
			BigPaddle.setSizeLocation({x:300 * canvas.width / 1200, y:150 * canvas.height / 800}, {x:825 * canvas.width / 1200, y:260 * canvas.height / 800});
		}
		return [SmallPaddle, RegularPaddle, BigPaddle];
	}, [canvas, Images.buttonPaddleBig, Images.buttonPaddleRegular, Images.buttonPaddleSmall]);

	const characterButtons = useMemo(() => {
		var Scorpion:Button = new Button("Scorpion", Character.Scorpion, {x:200, y:100}, {x:30, y:360}, Images.buttonCharVentail);
		var SubZero:Button = new Button("SubZero", Character.SubZero, {x:200, y:100}, {x:300, y:360}, Images.buttonCharBz);
		var Raiven:Button = new Button("Raiven", Character.Raiden, {x:200, y:100}, {x:300, y:360}, Images.buttonCharRaiven);
		if (canvas)
		{
			Scorpion.setSizeLocation({x:300 * canvas.width / 1200, y:150 * canvas.height / 800}, {x:75 * canvas.width / 1200, y:490 * canvas.height / 800});
			SubZero.setSizeLocation({x:300 * canvas.width / 1200, y:150 * canvas.height / 800}, {x:450 * canvas.width / 1200, y:490 * canvas.height / 800});
			Raiven.setSizeLocation({x:300 * canvas.width / 1200, y:150 * canvas.height / 800}, {x:825 * canvas.width / 1200, y:490 * canvas.height / 800});
		}
		return [Scorpion, SubZero, Raiven];
	}, [canvas, Images.buttonCharBz, Images.buttonCharRaiven, Images.buttonCharVentail]);

	const handleStartGame = useCallback(() => {
		scorpionSpecialSound.preload = 'auto';
		subZeroSpecialSound.preload = 'auto';
		raidenSpecialSound.preload = 'auto';
		soundGrenadeSound.preload = 'auto';
		scorpionSpecialSound.load();
		subZeroSpecialSound.load();
		raidenSpecialSound.load();
		soundGrenadeSound.load();
		try {
			var opt = new Options(selectedGamemode, selectedPaddle, selectedCharacter, hyperButton.selected, dodgeButton.selected);
			console.log('Socket:', socket);
			socket.current?.emit('start', opt);
		} catch (error) {
		console.error('Failed to start the game:', error);
		}
	}, [selectedCharacter, selectedGamemode, selectedPaddle, hyperButton.selected, dodgeButton.selected, scorpionSpecialSound, subZeroSpecialSound, raidenSpecialSound, soundGrenadeSound]);

	const handleStopGame = async () => {
		setGameStarted(false);
		try {
			await axios.post('/game/stop');
		} catch (error) {
			console.error('Failed to stop the game:', error);
		}
	};

	const drawButton = useCallback((ctx: CanvasRenderingContext2D, button: Button, selectedOption: number = -1, radius: number = 20) => {
		const { coordinates, size, image, isFocused, selected } = button;
		const { x, y } = coordinates;
		const { x: width, y: height } = size;
		const otherButtonSelected = selectedOption > -1 && selectedOption !== Mode.Start && selectedOption !== Mode.Reset && !selected;

		if (selectedOption !== Mode.Reset) {
			ctx.fillStyle = backgroundColor;
			ctx.fillRect(x, y, width, height);
		}
		ctx.fillStyle = 'white';
		roundedRect(ctx, x, y, width, height, radius);
		if (selectedOption < Mode.Hyper) {
			ctx.drawImage(image, x, y, width, height);
		} else {
			ctx.fillStyle = backgroundColor;
			ctx.fillRect(x - 2, y - 2, width + 190, height + 4);
			ctx.fillStyle = 'black';
			ctx.font = '20px Arial';
			ctx.fillText(button.name, x + 120, y + 14);
		}
		if (!isFocused && ((!selected && !otherButtonSelected && !regular) || selectedOption === Mode.Start)) {
			ctx.globalAlpha = 0.25;
			ctx.fillStyle = "black";
			roundedRect(ctx, x, y, width, height, radius);
			ctx.globalAlpha = 1;
		} else if (selected && (!regular || button.id === Mode.Regular)) {
			ctx.strokeStyle = "red";
			ctx.lineWidth = 2;
			roundedRect(ctx, x, y, width, height, radius, true);
		} else if (otherButtonSelected || (button.id !== Mode.Regular && regular && selectedOption !== Mode.Start)) {
			ctx.globalAlpha = 0.5;
			ctx.fillStyle = "black";
			roundedRect(ctx, x, y, width, height, radius);
			ctx.globalAlpha = 1;
		}
	}, [regular]);

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
		if (checkMouseOnButton(startButton, e, canvas))
			startButton.isFocused = true;
		else if (startButton.isFocused)
			startButton.isFocused = false;
		drawButton(ctx, startButton, Mode.Start);
		if (checkMouseOnButton(hyperButton, e, canvas))
			hyperButton.isFocused = true;
		else if (hyperButton.isFocused)
			hyperButton.isFocused = false;
		drawButton(ctx, hyperButton, Mode.Hyper, 5);
		if (checkMouseOnButton(dodgeButton, e, canvas))
			dodgeButton.isFocused = true;
		else if (dodgeButton.isFocused)
			dodgeButton.isFocused = false;
		drawButton(ctx, dodgeButton, Mode.Dodge, 5);
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
			drawButton(ctx, paddleButtons[index], selectedPaddle);
		}
		for (index in characterButtons) {
			if (checkMouseOnButton(characterButtons[index], e, canvas))
				characterButtons[index].isFocused = true;
			else if (characterButtons[index].isFocused === true)
				characterButtons[index].isFocused = false;
			drawButton(ctx, characterButtons[index], selectedCharacter);
		}
	}, [gamemodeButtons, paddleButtons, canvas, ctx, selectedGamemode, drawButton, selectedPaddle, characterButtons, selectedCharacter, startButton, hyperButton, dodgeButton]);
	
	const clearSelection = useCallback(() => {
		for (var index in paddleButtons) {
			if (paddleButtons[index].selected)
				paddleButtons[index].selected = false;
		}
		setSelectedPaddle(-1);
		for (index in characterButtons) {
			if (characterButtons[index].selected)
				characterButtons[index].selected = false;
		}
		setSelectedCharacter(-1);
	}, [characterButtons, paddleButtons]);

	const handleMouseClick = useCallback((e: MouseEvent) => {
		console.log("Handle mouse click");
		if (!canvas || !ctx)
			return;
		if (checkMouseOnButton(startButton, e, canvas)) {
			if ((selectedGamemode !== -1 && selectedPaddle !== -1 && selectedCharacter !== -1) || selectedGamemode === Mode.Regular) {
				if (selectedGamemode !== Mode.Regular) {
					setAbilities(true);
					switch (selectedCharacter) {
						case Character.Scorpion:
							setPlayerUlt(Images.ScorpionSpecial);
							break;
						case Character.SubZero:
							setPlayerUlt(Images.SubZeroSpecial);
							break;
						case Character.Raiden:
							setPlayerUlt(Images.RaidenSpecial);
							break;
					}
					if (dodgeButton.selected)
						setPlayerUlt(Images.RaidenSpecial);
				}
				setPlayerChose(true);
				setGameSelection(false);
				canvas.removeEventListener("mousemove", handleMouseMove);
				canvas.removeEventListener("click", handleMouseClick);
				return;
			}
			else {
				ctx.font = '30px Arial'; //ITC Zapf Chancery
				ctx.fillText("Choose game settings to continue", 600, 770);
				return;
			}
		}
		if (checkMouseOnButton(hyperButton, e, canvas)) {
			if (hyperButton.selected) {
				hyperButton.selected = false;
			} else {
				hyperButton.selected = true;
			}
			drawButton(ctx, hyperButton, Mode.Hyper, 5);
			return;
		}
		if (checkMouseOnButton(dodgeButton, e, canvas)) {
			if (dodgeButton.selected) {
				dodgeButton.selected = false;
			} else {
				dodgeButton.selected = true;
			}
			drawButton(ctx, dodgeButton, Mode.Dodge, 5);
			return;
		}
		for (var index in gamemodeButtons) {
			if (checkMouseOnButton(gamemodeButtons[index], e, canvas)) {
				if (selectedGamemode !== -1) {
					if (gamemodeButtons[index].selected) {
						gamemodeButtons[index].selected = false;
						if (gamemodeButtons[index].id === Mode.Regular)
							setRegular(false);
						setSelectedGamemode(-1);
					}
					else {
						for (var button in gamemodeButtons) {
							if (gamemodeButtons[button].selected) {
								gamemodeButtons[button].selected = false;
								if (gamemodeButtons[button].id === Mode.Regular)
									setRegular(false);
								gamemodeButtons[index].selected = true;
								if (gamemodeButtons[index].id === Mode.Regular) {
									clearSelection();
									setRegular(true);
								}
								setSelectedGamemode(gamemodeButtons[index].id);
							}
						}
					}
				}
				else {
					setSelectedGamemode(gamemodeButtons[index].id);
					gamemodeButtons[index].selected = true;
					if (gamemodeButtons[index].id === Mode.Regular) {
						clearSelection();
						setRegular(true);
					}
				}
				for (var toDraw in gamemodeButtons) {
					drawButton(ctx, gamemodeButtons[toDraw], selectedGamemode);
				}
				drawButton(ctx, startButton, Mode.Start);
				return;
			}
		}
		for (index in paddleButtons) {
			if (checkMouseOnButton(paddleButtons[index], e, canvas)) {
				if (!regular) {
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
				}
				for (toDraw in paddleButtons) {
					drawButton(ctx, paddleButtons[toDraw], selectedPaddle);
				}
				return;
			}
		}
		for (index in characterButtons) {
			if (checkMouseOnButton(characterButtons[index], e, canvas)) {
				if (!regular) {
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
									setSelectedCharacter(characterButtons[index].id);
								}
							}
						}
					}
					else {
						setSelectedCharacter(characterButtons[index].id);
						characterButtons[index].selected = true;
					}
				}
				for (toDraw in characterButtons) {
					drawButton(ctx, characterButtons[toDraw], selectedCharacter);
				}
				return;
			}
		}
	}, [canvas, drawButton, ctx, gamemodeButtons, paddleButtons, handleMouseMove, selectedGamemode, selectedPaddle, characterButtons, selectedCharacter, Images.RaidenSpecial, Images.SubZeroSpecial, Images.ScorpionSpecial, startButton, clearSelection, regular, hyperButton, dodgeButton]);

	const handleFinishClick = useCallback((e: MouseEvent) => {
		if (!canvas || !ctx)
			return;
		if (checkMouseOnButton(resetButton, e, canvas)) {
			setGameSelection(true);
			setBallSize(15);
		}
	}, [canvas, ctx, resetButton]);

	const handleFinishMove = useCallback((e: MouseEvent) => {
		if (!canvas || !ctx)
			return;
		if (checkMouseOnButton(resetButton, e, canvas))
			resetButton.isFocused = true;
		else if (resetButton.isFocused)
			resetButton.isFocused = false;
		drawButton(ctx, resetButton, Mode.Reset);
	}, [canvas, ctx, drawButton, resetButton]);
	

	function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, clear: boolean = false) {
		ctx.beginPath();
		ctx.moveTo(x, y + radius);
		ctx.arcTo(x, y + height, x + radius, y + height, radius);
		ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
		ctx.arcTo(x + width, y, x + width - radius, y, radius);
		ctx.arcTo(x, y, x, y + radius, radius);
		if (clear)
			ctx.stroke();
		else
			ctx.fill();
	};


	const handleKeyUp = useCallback((event: KeyboardEvent) => {
		const stopPressUp = async () => {
			try {
				socket.current?.emit('moveUpDisable');
				console.log('stopMoveUp');
			} catch (error) {
				console.error('Failed to stop moving the paddle up:', error);
			}
		};
		const stopPressDown = async () => {
			try {
				socket.current?.emit('moveDownDisable');
				console.log('stopMoveDown');
			} catch (error) {
				console.error('Failed to stop moving the paddle down:', error);
			}
		};
		if (event.key === 'ArrowUp') {
			stopPressUp();
			setArrowUp(false);
		} else if (event.key === 'ArrowDown') {
			stopPressDown();
			setArrowDown(false);
		}
		if (dodgeButton.selected && event.key === 'ArrowLeft') {
			try {
				socket.current?.emit('moveDisable', 1);
				setArrowLeft(false);
				console.log('stopMoveLeft');
			} catch (error) {
				console.error('Failed to stop moving the paddle left:', error);
			}
		} else if (dodgeButton.selected && event.key === 'ArrowRight') {
			try {
				socket.current?.emit('moveDisable', 2);
				console.log('stopMoveRight');
				setArrowRight(false);
			} catch (error) {
				console.error('Failed to stop moving the paddle right:', error);
			}
		}
	}, [dodgeButton.selected]);

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
				console.log('moveUpEnable');
			} catch (error) {
				console.error('Failed to move the paddle up:', error);
			}
		};
	
		const moveDown = async () => {
			try {
				socket.current?.emit('moveDownEnable');
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
		else if (dodgeButton.selected && event.key === 'ArrowLeft' && !arrowLeft) {
			setArrowLeft(true);
			try {
				socket.current?.emit('moveEnable', 1);
				console.log('moveLeftEnable');
			} catch (error) {
				console.error('Failed to move the paddle left:', error);
			}
		}
		else if (dodgeButton.selected && event.key === 'ArrowRight' && !arrowRight) {
			setArrowRight(true);
			try {
				socket.current?.emit('moveEnable', 2);
				console.log('moveRightEnable');
			} catch (error) {
				console.error('Failed to move the paddle right:', error);
			}
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
	}, [arrowDown, arrowUp, abilities, selectedCharacter, hasUlt, arrowLeft, arrowRight, dodgeButton.selected]);

	useEffect(() => {
		socket.current = io('http://localhost:8002');
		// if (render === false)
		// 	setRender(true);
		// else
		// 	setRender(false);
		socket.current?.emit('loadWindow');
		return () => {
			if (socket.current) {
				socket.current.disconnect();
			}
		};
	}, []);
	// !!!!! if we include the missing dependancies the canvas won't render on restart / refresh

	useEffect(() => {
		if (socket.current) {
			socket.current.on('gameInit', (event: any) => {
				const { player, ability } = event;
				setPlayer(player);
				switch(ability) {
					case 0:
						setPlayerAbility(Images.SmallerBallAbility);
						break;
					case 1:
						setPlayerAbility(Images.FreezeAbility);
						break;
					case 2:
						setPlayerAbility(Images.SoundGrenadeAbility);
						break;
					case 3:
						setPlayerAbility(Images.BiggerBallAbility);
						break;
					case 4:
						setPlayerAbility(Images.MirageAbility);
						break;
					case 5:
						break;
				}
				setGameInit(true);
				setPlayerWaiting(false);
			});
			socket.current.on('ballUpdate', (event: any) => {
				console.log("Got the ball position update");
				const { ball } = event;
				setBallPosition(ball);
			});
			socket.current.on('scoreUpdate', (event: any) => {
				const { score } = event;
				setScore(score);
				setPlayer1Frozen(false);
				setPlayer2Frozen(false);
				setRaidenSpecial(false);
				setAbilityFreeze(false);
				setScorpionSpecial(false);
				setAbilityMirage(false);
				subZeroSpecialSound.muted = true;
				scorpionSpecialSound.muted = true;
				raidenSpecialSound.muted = true;
			});
			socket.current.on('player1Update', (event: any) => {
				const { player1 } = event;
				setPlayer1Position(player1);
			});
			socket.current.on('player2Update', (event: any) => {
				const { player2 } = event;
				setPlayer2Position(player2);
			});
			socket.current.on('player1X', (event: any) => {
				const { player1X } = event;
				setPlayer1PositionX(player1X);
			});
			socket.current.on('player2X', (event: any) => {
				const { player2X } = event;
				setPlayer2PositionX(player2X);
			});
			socket.current.on('winnerUpdate', (event: any) => {
				const { winner } = event;
				setWinner(winner);
			});
			socket.current.on('gameStatus', (event: any) => {
				const { gameStatus } = event;
				setGameStarted(gameStatus);
			});
			socket.current.on('loadWindow', (event: any) => {
				const { load } = event;
				setRender(load);
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
					scorpionSpecialSound.muted = false;
					scorpionSpecialSound.play();
				});
				socket.current.on('SubZeroSpecial', (event: any) => {
					const { target } = event;
					if (target === -1) {
						setPlayer1Frozen(false);
					} else if (target === -2) {
						setPlayer2Frozen(false);
					} else if (target === 1) {
						setPlayer1Frozen(true);
						subZeroSpecialSound.muted = false;
						subZeroSpecialSound.play();
					} else if (target === 2) {
						setPlayer2Frozen(true);
						subZeroSpecialSound.muted = false;
						subZeroSpecialSound.play();
					}
				});
				socket.current.on('RaidenSpecial', (event: any) => {
					const { RaidenSpecial } = event;
					setRaidenSpecial(RaidenSpecial);
					if (RaidenSpecial) {
						raidenSpecialSound.muted = false;
						raidenSpecialSound.play();
					}
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

				socket.current.on('hasAbility', (event: any) => {
					const { hasAbility, ability } = event;
					setHasAbility(hasAbility);
					if (dodgeButton.selected)
						setSecondsLeft(5);
					else
						setSecondsLeft(15);
					if (!hasAbility) {
						setAbilityCooldownImage(Images.Cooldown[0]);
						var animFrame = 1;
						const abilTimer = setInterval(() => {
							setAbilityCooldownImage(Images.Cooldown[animFrame % Images.Cooldown.length]);
							animFrame++;
							if (animFrame >= 30)
								clearInterval(abilTimer);
						}, 500);
					}
					switch(ability) {
						case 0:
							setPlayerAbility(Images.SmallerBallAbility);
							break;
						case 1:
							setPlayerAbility(Images.FreezeAbility);
							break;
						case 2:
							setPlayerAbility(Images.SoundGrenadeAbility);
							break;
						case 3:
							setPlayerAbility(Images.BiggerBallAbility);
							break;
						case 4:
							setPlayerAbility(Images.MirageAbility);
							break;
						case 5:
							setPlayerAbility(Images.HomingAbility);
							break;
					}
				});
				socket.current.on('hasUlt', (event: any) => {
					const { hasUlt } = event;
					setHasUlt(hasUlt);
					if (dodgeButton.selected)
						setSecondsLeftUlt(5);
					else
						setSecondsLeftUlt(15);
					if (!hasUlt) {
						setUltimateCooldownImage(Images.Cooldown[0]);
						var animFrame = 1;
						let ultTimer = setInterval(() => {
							setUltimateCooldownImage(Images.Cooldown[animFrame % Images.Cooldown.length]);
							animFrame++;
							console.log("frame:" + animFrame);
							if (animFrame >= 30)
								clearInterval(ultTimer);
						}, 500);
					}
				});
				socket.current.on('playerCharacter', (event: any) => {
					const { player1Character, player1Size, player2Character, player2Size } = event;
					console.log("player1Character" + player1Character);
					console.log("player1Size: " + player1Size);
					console.log("player2Character: " + player2Character);
					console.log("player2Size: " + player2Size);
					switch (player2Character) {
						case Character.Scorpion:
							switch (player2Size) {
								case Paddles.Small:
									setPlayer2Character(Images.paddleVentailS);
									setPlayer2Size({width: 10, height: 50});
									break;
								case Paddles.AverageJoe:
									setPlayer2Character(Images.paddleVentailM);
									setPlayer2Size({width: 20, height: 100});
									break;
									case Paddles.BigPete:
										setPlayer2Character(Images.paddleVentailL);
									setPlayer2Size({width: 32, height: 160});
									break;
								}
								break;
								case Character.SubZero:
									switch (player2Size) {
								case Paddles.Small:
									setPlayer2Character(Images.paddleBzS);
									setPlayer2Size({width: 10, height: 50});
									break;
								case Paddles.AverageJoe:
									setPlayer2Character(Images.paddleBzM);
									setPlayer2Size({width: 20, height: 100});
									break;
								case Paddles.BigPete:
									setPlayer2Character(Images.paddleBzL);
									setPlayer2Size({width: 32, height: 160});
									break;
							}
							break;	
						case Character.Raiden:
							switch (player2Size) {
								case Paddles.Small:
									setPlayer2Character(Images.paddleRaivenS);
									setPlayer2Size({width: 10, height: 50});
									break;
								case Paddles.AverageJoe:
									setPlayer2Character(Images.paddleRaivenM);
									setPlayer2Size({width: 20, height: 100});
									break;
								case Paddles.BigPete:
									setPlayer2Character(Images.paddleRaivenL);
									setPlayer2Size({width: 32, height: 160});
									break;
							}
					}		
					switch (player1Character) {
						case Character.Scorpion:
							switch (player1Size) {
								case Paddles.Small:
									setPlayer1Character(Images.paddleVentailS);
									setPlayer1Size({width: 10, height: 50});
									break;
								case Paddles.AverageJoe:
									setPlayer1Character(Images.paddleVentailM);
									setPlayer1Size({width: 20, height: 100});
									break;
								case Paddles.BigPete:
									setPlayer1Character(Images.paddleVentailL);
									setPlayer1Size({width: 32, height: 160});
									break;
							}
							break;
						case Character.SubZero:
							switch (player1Size) {
								case Paddles.Small:
									setPlayer1Character(Images.paddleBzS);
									setPlayer1Size({width: 10, height: 50});
									break;
								case Paddles.AverageJoe:
									setPlayer1Character(Images.paddleBzM);
									setPlayer1Size({width: 20, height: 100});
									break;
								case Paddles.BigPete:
									setPlayer1Character(Images.paddleBzL);
									setPlayer1Size({width: 32, height: 160});
									break;
							}
							break;	
						case Character.Raiden:
							switch (player1Size) {
								case Paddles.Small:
									setPlayer1Character(Images.paddleRaivenS);
									setPlayer1Size({width: 10, height: 50});
									break;
								case Paddles.AverageJoe:
									setPlayer1Character(Images.paddleRaivenM);
									setPlayer1Size({width: 20, height: 100});
									break;
								case Paddles.BigPete:
									setPlayer1Character(Images.paddleRaivenL);
									setPlayer1Size({width: 32, height: 160});
									break;
							}
					}
				});
				return () => {
					socket.current?.off('hasUlt');
					socket.current?.off('hasAbility');
					socket.current?.off('playerCharacter');
					socket.current?.off('secondsLeft');
					socket.current?.off('secondsLeftUlt');
					socket.current?.off('gameStatus');
					socket.current?.off('winnerUpdate');
					socket.current?.off('player2Update');
					socket.current?.off('player1Update');
					socket.current?.off('player1X');
					socket.current?.off('player2X');
					socket.current?.off('scoreUpdate');
					socket.current?.off('ballUpdate');
					socket.current?.off('gameInit');
					socket.current?.off('mirageUpdate');
					socket.current?.off('AbilityMirage');
					socket.current?.off('SoundGrenade');
					socket.current?.off('BallSize');
					socket.current?.off('ScorpionSpecial');
					socket.current?.off('SubZeroSpecial');
					socket.current?.off('RaidenSpecial');
				};
			}
			return () => {
				socket.current?.off('gameStatus');
				socket.current?.off('winnerUpdate');
				socket.current?.off('player2Update');
				socket.current?.off('player1Update');
				socket.current?.off('player1X');
				socket.current?.off('player2X');
				socket.current?.off('scoreUpdate');
				socket.current?.off('ballUpdate');
				socket.current?.off('gameInit');
			}
		}
	}, [abilities, hasAbility, Images.BiggerBallAbility, Images.MirageAbility, Images.SmallerBallAbility, Images.FreezeAbility, Images.SoundGrenadeAbility, player, scorpionSpecialSound, soundGrenadeSound, Images.paddleBzL, Images.paddleBzM, Images.paddleBzS, Images.paddleVentailL, Images.paddleVentailM, Images.paddleVentailS, Images.paddleRaivenL, Images.paddleRaivenM, Images.paddleRaivenS, Images.Cooldown, secondsLeft, Images.HomingAbility, dodgeButton, subZeroSpecialSound, raidenSpecialSound]);

	useEffect(() => {
		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('keyup', handleKeyUp);
		if (isGameSelection) {
			canvas?.addEventListener("click", handleMouseClick);
			canvas?.addEventListener("mousemove", handleMouseMove);
		}
		return () => {
			if (isGameSelection) {
				canvas?.removeEventListener("click", handleMouseClick);
				canvas?.removeEventListener("mousemove", handleMouseMove);
			}
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('keyup', handleKeyUp);
		}
	}, [canvas, handleMouseClick, handleMouseMove, handleKeyUp, handleKeyDown, isGameSelection]);

	// function animateStartLoading() {
	// 	if (canvas && ctx) {
	// 		var startIndex = Images.YinYangEnd.length - 1;
	// 		const animInterval = setInterval(() => {
	// 			ctx.drawImage(Images.YinYangEnd[startIndex], 0, 0, canvas.width, canvas.height);
	// 			console.log("Image : " + startIndex);
	// 			startIndex--;
	// 			if (startIndex < 0) {
	// 				clearInterval(animInterval);
	// 				setPlayerChose(false);
	// 				handleStartGame();
	// 				setPlayerWaiting(true);
	// 				return;
	// 			}
	// 		}, 33);
	// 		return () => clearInterval(animInterval);
	// 	}
	// }

	useEffect(() => {
		if (canvas) {
			if (ctx) {
				if (isGameStarted) {
					ctx.fillStyle = backgroundColor;
					if (raidenSpecial) {
						ctx.fillRect(10, player1Position - 10, 20, 120);
						ctx.globalAlpha = 0.1;
					}
					ctx.fillRect(0, 0, canvas.width, canvas.height);
					ctx.fillStyle = 'white';
					ctx.globalAlpha = 1;
					console.log("Selected GameMode: " + selectedGamemode);
					if (selectedGamemode !== Mode.Regular) {
						ctx.drawImage(player1Character, player1PositionX, player1Position);
						ctx.drawImage(player2Character, player2PositionX, player2Position);
						if (player === 1) {
							ctx.font = '27px Arial';
							ctx.fillStyle = 'black';
							if (hasUlt)
								ctx.drawImage(playerUlt, 80, 700, 60, 60);
							else {
								ctx.drawImage(ultimateCooldownImage, 80, 700, 60, 60);
								if (secondsLeftUlt < 10)
									ctx.fillText(`${secondsLeftUlt}`, 110, 732);
								else
									ctx.fillText(`${secondsLeftUlt}`, 108, 732);
							}
							if (hasAbility)
								ctx.drawImage(playerAbility, 150, 700, 60, 60);
							else {
								ctx.drawImage(abilityCooldownImage, 150, 700, 60, 60);
								if (secondsLeft < 10)
									ctx.fillText(`${secondsLeft}`, 180, 732);
								else
									ctx.fillText(`${secondsLeft}`, 178, 732);
							}
						} else if (player === 2) {
							ctx.font = '27px Arial';
							ctx.fillStyle = 'black';
							if (hasAbility)
								ctx.drawImage(playerAbility, 1060, 700, 60, 60);
							else {
								ctx.drawImage(abilityCooldownImage, 1060, 700, 60, 60);
								if (secondsLeft < 10)
									ctx.fillText(`${secondsLeft}`, 1090, 732);
								else
									ctx.fillText(`${secondsLeft}`, 1088, 732);
							}
							if (hasUlt)
								ctx.drawImage(playerUlt, 990, 700, 60, 60);
							else {
								ctx.drawImage(ultimateCooldownImage, 990, 700, 60, 60);
								if (secondsLeftUlt < 10)
									ctx.fillText(`${secondsLeftUlt}`, 1020, 732);
								else
									ctx.fillText(`${secondsLeftUlt}`, 1018, 732);
							}
						}		
					}	
					else {
						ctx.fillStyle = 'white';
						ctx.fillRect(player1PositionX, player1Position, 20, 100);
						ctx.fillRect(player2PositionX, player2Position, 20, 100);

						ctx.strokeStyle = 'black';
						ctx.lineWidth = 2;
						ctx.strokeRect(player1PositionX, player1Position, 20, 100);
						ctx.strokeRect(player2PositionX, player2Position, 20, 100);
					}


					if (player1Frozen) {
							ctx.globalAlpha = 0.50;
							ctx.drawImage(Images.iceBlock, 5, player1Position - 10, player1Size.width + 10, player1Size.height + 20);
							ctx.globalAlpha = 1;
					}
					if (player2Frozen) {
						ctx.globalAlpha = 0.50;
						ctx.drawImage(Images.iceBlock, 1165, player2Position - 10, player2Size.width + 10, player2Size.height + 20);
						ctx.globalAlpha = 1;
					}
			
					if (abilities) {
						// p1 health border
						ctx.drawImage(Images.healthText, 185, 60, 140, 25);
						ctx.font = '20px Arial';
						ctx.fillStyle = 'black';
						ctx.fillText("Someone", 255, 75);
						ctx.drawImage(Images.left_bar, 150, 25, 25, 40);
						ctx.drawImage(Images.mid_bar, 175, 25, 25, 40);
						ctx.drawImage(Images.mid_bar, 200, 25, 25, 40);
						ctx.drawImage(Images.mid_bar, 225, 25, 26, 40);
						ctx.drawImage(Images.mid_bar, 251, 25, 26, 40);
						ctx.drawImage(Images.mid_bar, 277, 25, 26, 40);
						ctx.drawImage(Images.right_bar, 303, 25, 25, 40);
						ctx.drawImage(Images.iconBackground, 120, 25, 45, 45);
						ctx.drawImage(Images.icon, 131, 38, 23, 20);
						ctx.font = '15px Arial';
						ctx.fillText(`${11 - score.p2}`, 142, 50);
						// p2 health border
						ctx.drawImage(Images.healthText, 875, 60, 140, 25);
						ctx.font = '20px Arial';
						ctx.fillText("Someone", 945, 75);
						ctx.drawImage(Images.left_bar, 872, 25, 25, 40);
						ctx.drawImage(Images.mid_bar, 897, 25, 26, 40);
						ctx.drawImage(Images.mid_bar, 923, 25, 26, 40);
						ctx.drawImage(Images.mid_bar, 949, 25, 26, 40);
						ctx.drawImage(Images.mid_bar, 975, 25, 25, 40);
						ctx.drawImage(Images.mid_bar, 1000, 25, 25, 40);
						ctx.drawImage(Images.right_bar, 1025, 25, 25, 40);
						ctx.drawImage(Images.iconBackground, 1035, 25, 45, 45);
						ctx.drawImage(Images.icon, 1046, 38, 23, 20);
						ctx.font = '15px Arial';
						ctx.fillText(`${11 - score.p1}`, 1057, 50);
						var x = 0;
						// draw p1 health bars
						while (x < 11 - score.p2) {
							if (x === 0)
								ctx.drawImage(Images.left_health, 151, 25, 25, 40);
							else if (x === 10)
								ctx.drawImage(Images.right_health, 303, 25, 25, 40);
							else
							ctx.drawImage(Images.mid_health, 163 + 14 * x, 25, 13, 40);
							x++;
						}			
						x = 0;
						// draw p2 health bars
						while (x < 11 - score.p1) {
								if (x === 0)
									ctx.drawImage(Images.right_health, 1024, 25, 25, 40);
							else if (x === 10)
									ctx.drawImage(Images.left_health, 872, 25, 25, 40);
							else
									ctx.drawImage(Images.mid_health, 1024 - 14 * x, 25, 13, 40);
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
							ctx.globalAlpha = 0.50;
							ctx.drawImage(Images.iceBlock, ballPosition.x - ballSize - 10, ballPosition.y - ballSize - 10, ballSize*2 + 20, ballSize*2 + 20);
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
							ctx.globalAlpha = 0.75;
							for (var i in miragePos) {
								ctx.beginPath();
								ctx.arc(miragePos[i][0], miragePos[i][1], ballSize, 0, Math.PI * 2);
								ctx.fill();
								ctx.closePath();
								ctx.strokeStyle = 'black';
								ctx.beginPath();
								ctx.lineWidth = 2;
								ctx.arc(miragePos[i][0], miragePos[i][1], ballSize, -2, Math.PI * 2);
								ctx.stroke();
							}
							ctx.globalAlpha = 1;
						}
					} else {
						ctx.font = '30px Arial';
						ctx.fillStyle = 'white';
						ctx.textAlign = 'center';
						ctx.textBaseline = 'middle';
						ctx.fillText(`${score.p1} - ${score.p2}`, canvas.width / 2, 30);
						// ctx.font = '40px Arial';
						// ctx.fillText(`${winner}`, canvas.width / 2, canvas.height - 50);

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
				} else if (isGameSelection) {
					ctx.globalAlpha = 1;
					ctx.clearRect(0, 0, canvas.width, canvas.height);
					ctx.fillStyle = backgroundColor;
					ctx.fillRect(0, 0, canvas.width, canvas.height);
					ctx.font = '40px Arial'; //ITC Zapf Chancery
					ctx.fillStyle = 'white';
					ctx.textAlign = 'center';
					ctx.textBaseline = 'middle';

					ctx.drawImage(Images.headGamemode, canvas.width / 2 - 150, 20, 300, 75);
					ctx.drawImage(Images.headPaddle, canvas.width / 2 - 150, 190, 300, 75);
					ctx.drawImage(Images.headCharacter, canvas.width / 2 - 150, 420, 300, 75);

					drawButton(ctx, startButton, Mode.Start);
					for (var index in gamemodeButtons) {
						drawButton(ctx, gamemodeButtons[index], selectedGamemode);
					}
					for (index in paddleButtons) {
						// drawImages(ctx, paddleButtons[index], selectedPaddle);
						drawButton(ctx, paddleButtons[index], selectedPaddle);
					}
					for (index in characterButtons) {
						// drawImages(ctx, characterButtons[index], selectedCharacter);
						drawButton(ctx, characterButtons[index], selectedCharacter);
					}
					drawButton(ctx, hyperButton, Mode.Hyper, 5);
					drawButton(ctx, dodgeButton, Mode.Dodge, 5);
				} else if (playerChose) {
					var startIndex = Images.YinYangEnd.length - 1;
					const animInterval = setInterval(() => {
						ctx.drawImage(Images.YinYangEnd[startIndex], 0, 0, canvas.width, canvas.height);
						console.log("Image : " + startIndex);
						startIndex--;
						if (startIndex < 0) {
							clearInterval(animInterval);
							setPlayerChose(false);
							handleStartGame();
							setPlayerWaiting(true);
							return;
						}
					}, 15);
					return () => clearInterval(animInterval);
				} else if (isPlayerWaiting) {
					var rotIndex = 0;
					const animInterval = setInterval(() => {
						ctx.drawImage(Images.YinYangRotate[rotIndex], 0, 0, canvas.width, canvas.height);
						rotIndex++;
						if (rotIndex === Images.YinYangRotate.length) {
							rotIndex = 0;
						}
					}, 33);
					return () => clearInterval(animInterval);
				} else if (isGameInit) {
					var rotaIndex = 0;
					var endIndex = 0;
					const animInterval = setInterval(() => {
						if (rotaIndex === Images.YinYangRotate.length) {
							ctx.fillStyle = backgroundColor;
							ctx.fillRect(0, 0, canvas.width, canvas.height);
							ctx.fillStyle = 'white';
							ctx.globalAlpha = 1;
							if (selectedGamemode !== Mode.Regular) {
								ctx.drawImage(player1Character, player1PositionX, player1Position);
								ctx.drawImage(player2Character, player2PositionX, player2Position);
								if (player === 1) {
										ctx.drawImage(playerUlt, 80, 700, 60, 60);
										ctx.drawImage(playerAbility, 150, 700, 60, 60);
								} else if (player === 2) {
										ctx.drawImage(playerAbility, 1060, 700, 60, 60);
										ctx.drawImage(playerUlt, 990, 700, 60, 60);
								}	
							} else {
								ctx.fillStyle = 'white';
								ctx.fillRect(player1PositionX, player1Position, 20, 100);
								ctx.fillRect(player2PositionX, player2Position, 20, 100);
								
								ctx.strokeStyle = 'black';
								ctx.lineWidth = 2;
								ctx.strokeRect(player1PositionX, player1Position, 20, 100);
								ctx.strokeRect(player2PositionX, player2Position, 20, 100);
							}
							if (abilities) {
								// p1 health border
								ctx.drawImage(Images.healthText, 185, 60, 140, 25);
								ctx.font = '20px Arial';
								ctx.fillStyle = 'black';
								ctx.fillText("Someone", 255, 75);
								ctx.drawImage(Images.left_bar, 150, 25, 25, 40);
								ctx.drawImage(Images.mid_bar, 175, 25, 25, 40);
								ctx.drawImage(Images.mid_bar, 200, 25, 25, 40);
								ctx.drawImage(Images.mid_bar, 225, 25, 26, 40);
								ctx.drawImage(Images.mid_bar, 251, 25, 26, 40);
								ctx.drawImage(Images.mid_bar, 277, 25, 26, 40);
								ctx.drawImage(Images.right_bar, 303, 25, 25, 40);
								ctx.drawImage(Images.iconBackground, 120, 25, 45, 45);
								ctx.drawImage(Images.icon, 131, 38, 23, 20);
								ctx.font = '15px Arial';
								ctx.fillText(`${11 - score.p2}`, 142, 50);
								// p2 health border
								ctx.drawImage(Images.healthText, 875, 60, 140, 25);
								ctx.font = '20px Arial';
								ctx.fillText("Someone", 945, 75);
								ctx.drawImage(Images.left_bar, 872, 25, 25, 40);
								ctx.drawImage(Images.mid_bar, 897, 25, 26, 40);
								ctx.drawImage(Images.mid_bar, 923, 25, 26, 40);
								ctx.drawImage(Images.mid_bar, 949, 25, 26, 40);
								ctx.drawImage(Images.mid_bar, 975, 25, 25, 40);
								ctx.drawImage(Images.mid_bar, 1000, 25, 25, 40);
								ctx.drawImage(Images.right_bar, 1025, 25, 25, 40);
								ctx.drawImage(Images.iconBackground, 1035, 25, 45, 45);
								ctx.drawImage(Images.icon, 1046, 38, 23, 20);
								ctx.font = '15px Arial';
								ctx.fillText(`${11 - score.p1}`, 1057, 50);
								var x = 0;
								// draw p1 health bars
								while (x < 11 - score.p2) {
									if (x === 0)
									ctx.drawImage(Images.left_health, 151, 25, 25, 40);
									else if (x === 10)
									ctx.drawImage(Images.right_health, 303, 25, 25, 40);
									else
									ctx.drawImage(Images.mid_health, 163 + 14 * x, 25, 13, 40);
									x++;
								}			
								x = 0;
								// draw p2 health bars
								while (x < 11 - score.p1) {
									if (x === 0)
									ctx.drawImage(Images.right_health, 1024, 25, 25, 40);
									else if (x === 10)
									ctx.drawImage(Images.left_health, 872, 25, 25, 40);
									else
									ctx.drawImage(Images.mid_health, 1024 - 14 * x, 25, 13, 40);
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
							} else {
								ctx.font = '30px Arial';
								ctx.fillStyle = 'white';
								ctx.textAlign = 'center';
								ctx.textBaseline = 'middle';
								ctx.fillText(`${score.p1} - ${score.p2}`, canvas.width / 2, 30);
							}
							ctx.fillStyle = 'black';
							ctx.font = '35px Arial';
							ctx.fillText("Someone", 600, 100);
							ctx.fillText("Someone Else", 600, 200);
							ctx.font = '40px Arial';
							ctx.fillText("VS", 600, 150);
							ctx.drawImage(Images.YinYangEnd[endIndex], 0, 0, canvas.width, canvas.height);
							endIndex++;
							if (endIndex === Images.YinYangEnd.length) {
								clearInterval(animInterval);
								setGameInit(false);
								setGameStarted(true);
								socket.current?.emit('readyToPlay');
								return;
							}
						}
						else {
							if (rotaIndex === Images.YinYangRotate.length)
								rotaIndex = 0;
							ctx.drawImage(Images.YinYangRotate[rotaIndex], 0, 0, canvas.width, canvas.height);
							rotaIndex++;
						}
					}, 33);
					return () => clearInterval(animInterval);
				} else {
					canvas?.addEventListener("click", handleFinishClick);
					canvas?.addEventListener("mousemove", handleFinishMove);
					const grd = ctx.createLinearGradient(0, 900, 0, 0);
					
					if (winner === player)
					{
						grd.addColorStop(0, "maroon");
						grd.addColorStop(0.5, "red");
						grd.addColorStop(1, "orange");
					} else {
						grd.addColorStop(0, "rgb(10, 20, 120)");
						grd.addColorStop(0.5, "rgb(70, 70, 100)");
						grd.addColorStop(1, "rgb(60, 60, 60)");
					}
					ctx.fillStyle = backgroundColor;
					ctx.fillRect(0, 0, canvas.width, canvas.height);
					ctx.font = 'bold 40px Arial';
					let c1max = 700;
					let c1min = 200;
					let c1x = 200;
					let c1behind = false;
					let c2max = 800;
					let c2min = 250;
					let c2x = 700;
					let c2behind = true;
					let c3max = 800;
					let c3min = 300;
					let c3x = 800;
					let c3behind = false;
					let timer: NodeJS.Timeout;
					if (winner === player) {
						ctx.fillStyle = 'white';
						ctx.fillText("You have reached transcendence", 600, 200);
						ctx.drawImage(Images.Mountains, 100, 300);
						ctx.drawImage(Images.Cloud1, c1x, 430);
						ctx.drawImage(Images.Cloud2, c2x, 535);
						ctx.drawImage(Images.Cloud3, c3x, 370);
						timer = setInterval(() => {
							ctx.fillStyle = grd;
							ctx.fillRect(0, 0, canvas.width, canvas.height);
							if (c1behind && c1x > c1min) {
								c1x -= 1;
								ctx.drawImage(Images.Cloud1, c1x, 430);
							}
							if (c2behind && c2x < c2max) {
								c2x += 1;
								ctx.drawImage(Images.Cloud2, c2x, 535);
							}
							if (c3behind && c3x > c3min) {
								c3x -= 1;
								ctx.drawImage(Images.Cloud3, c3x, 370);
							}
							ctx.drawImage(Images.Mountains, 100, 300);
							if (!c1behind && c1x < c1max) {
								c1x += 1;
								ctx.drawImage(Images.Cloud1, c1x, 430);
							}
							if (!c2behind && c2x > c2min) {
								c2x -= 1;
								ctx.drawImage(Images.Cloud2, c2x, 535);
							}
							if (!c3behind && c3x < c3max) {
								c3x += 1;
								ctx.drawImage(Images.Cloud3, c3x, 370);
							}
							ctx.fillStyle = 'white';
							ctx.fillText("You have reached transcendence", 600, 200);
							drawButton(ctx, resetButton, Mode.Reset);
							if (c1x === c1max || c1x === c1min)
								c1behind = !c1behind;
							if (c2x === c2max || c2x === c2min)
								c2behind = !c2behind;
							if (c3x === c3max || c3x === c3min)
								c3behind = !c3behind;
						}, 100);
						drawButton(ctx, resetButton, Mode.Reset);
					} else {
						ctx.fillStyle = 'black';
						ctx.fillText("Player " + winner + " reaches transcendence, leaving you in the dust.", 600, 200);
						ctx.drawImage(Images.Mountains, 100, 300);
						ctx.drawImage(Images.Cloud1, c1x, 430);
						ctx.drawImage(Images.Cloud2, c2x, 535);
						ctx.drawImage(Images.Cloud3, c3x, 370);
						let lightningCounter = 0;
						let c1LightningActive = false;
						let c2LightningActive = false;
						let c3LightningActive = false;
						let lightningPosition = 0;
						let lightningImage: HTMLImageElement;
						timer = setInterval(() => {
							ctx.fillStyle = grd;
							ctx.fillRect(0, 0, canvas.width, canvas.height);
							if (c1behind && c1x > c1min) {
								c1x -= 1;
								ctx.drawImage(Images.Cloud1, c1x, 430);
								if (c1LightningActive) {
									ctx.drawImage(lightningImage, lightningPosition, 506, 60, 180);
								}
							}
							if (c2behind && c2x < c2max) {
								c2x += 1;
								ctx.drawImage(Images.Cloud2, c2x, 535);
								if (c2LightningActive) {
									ctx.drawImage(lightningImage, lightningPosition, 575, 30, 90);
								}
							}
							if (c3behind && c3x > c3min) {
								c3x -= 1;
								ctx.drawImage(Images.Cloud3, c3x, 370);
								if (c3LightningActive) {
									ctx.drawImage(lightningImage, lightningPosition, 412, 30, 90);
								}
							}
							ctx.drawImage(Images.Mountains, 100, 300);
							if (!c1behind && c1x < c1max) {
								c1x += 1;
								ctx.drawImage(Images.Cloud1, c1x, 430);
								if (c1LightningActive) {
									ctx.drawImage(lightningImage, lightningPosition, 506, 60, 180);
								}
							}
							if (!c2behind && c2x > c2min) {
								c2x -= 1;
								ctx.drawImage(Images.Cloud2, c2x, 535);
								if (c2LightningActive) {
									ctx.drawImage(lightningImage, lightningPosition, 575, 30, 90);
								}
							}
							if (!c3behind && c3x < c3max) {
								c3x += 1;
								ctx.drawImage(Images.Cloud3, c3x, 370);
								if (c3LightningActive) {
									ctx.drawImage(lightningImage, lightningPosition, 412, 30, 90);
								}
							}
							ctx.fillStyle = 'black';
							ctx.fillText("Player " + winner + " reaches transcendence, leaving you in the dust.", 600, 200);
							drawButton(ctx, resetButton, Mode.Reset);
							if (c1x === c1max || c1x === c1min)
								c1behind = !c1behind;
							if (c2x === c2max || c2x === c2min)
								c2behind = !c2behind;
							if (c3x === c3max || c3x === c3min)
								c3behind = !c3behind;
							lightningCounter++;
							if (lightningCounter === 50) {
								lightningCounter = 0;
								switch (Math.floor(Math.random() * 4)) {
									case 0:
										lightningImage = Images.Lightning1;
										break;
									case 1:	
										lightningImage = Images.Lightning2;
										break;	
									case 2:
										lightningImage = Images.Lightning3;
										break;
									case 3:
										lightningImage = Images.Lightning4;
										break;
								}
								switch (Math.floor(Math.random() * 3)) {
									case 0:
										lightningPosition = c1x + 20 + Math.random() * 200;
										c1LightningActive = true;
										break;
									case 1:
										lightningPosition = c2x + 27 + Math.random() * 80;
										c2LightningActive = true;
										break;
									case 2:
										lightningPosition = c3x + 23 + Math.random() * 42;
										c3LightningActive = true;
										break;
								}
							} else if (lightningCounter === 5) {
								c1LightningActive = false;
								c2LightningActive = false;
								c3LightningActive = false;
							}
						}, 100);
						drawButton(ctx, resetButton, Mode.Reset);
					}
					return () => {
						clearInterval(timer);
						canvas?.removeEventListener("click", handleFinishClick);
						canvas?.removeEventListener("mousemove", handleFinishMove);
					}
				}
			}
		}
	}, [player1Position, player2Position, ballPosition, scorpionSpecial, score, winner, ballSize, drawButton, isGameStarted, gamemodeButtons, canvas, ctx, handleMouseMove, Images.iceBlock, abilityMirage, miragePos, paddleButtons, selectedGamemode, selectedPaddle, abilityFreeze, characterButtons, selectedCharacter, raidenSpecial, abilities, hasAbility, Images.healthText, Images.icon, Images.iconBackground, Images.left_bar, Images.left_health, Images.mid_bar, Images.mid_health, Images.right_bar, Images.right_health, player1Character, player2Character, secondsLeft, hasUlt, player1Size, playerAbility, playerUlt, secondsLeftUlt, player2Size.height, player2Size.width, scorpionTarget, Images.headGamemode, startButton, Images, isPlayerWaiting, isGameSelection, isGameInit, player1Frozen, player2Frozen, player, abilityCooldownImage, ultimateCooldownImage, resetButton, handleFinishClick, handleFinishMove, hyperButton, dodgeButton, playerChose, handleStartGame, player1PositionX, player2PositionX]);


	return (
		<div>
		<canvas ref={canvasRef} width={1200} height={800} style={{ backgroundColor: 'black', marginRight: '50' }}></canvas>
		</div>
	);
};

export default GameComponent;
