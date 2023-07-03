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
import { EndScreen } from './Canvas';

axios.defaults.baseURL = 'http://localhost:3333';

type GameComponentProps = {};

const GameComponent: React.FC<GameComponentProps> = () => {
	const VenomtailSpecialSound 	= useMemo(() => new Audio(GetOverHere), []);
	const BelowZeroSpecialSound 	= useMemo(() => new Audio(IceSound), []);
	const raivenSpecialSound 	= useMemo(() => new Audio(LightningSound), []);
	const soundGrenadeSound 	= useMemo(() => new Audio(SoundGrenade), []);

	const Images = useMemo(() => new ImageContainer(), []);
	const endScreen = useMemo(() => new EndScreen(), []);
	const [player, setPlayer] = useState<number>();
	const [player1Size, setPlayer1Size] = useState<{width: number, height: number}>({ width: 20, height: 100});
	const [player2Size, setPlayer2Size] = useState<{width: number, height: number}>({ width: 20, height: 100});
	const [player1Position, setPlayer1Position] = useState<number>(350);
	const [player2Position, setPlayer2Position] = useState<number>(350);
	const [player1PositionX, setPlayer1PositionX] = useState<number>(20);
	const [player2PositionX, setPlayer2PositionX] = useState<number>(1160);
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
	const [maxTimerAnim, setMaxTimerAnim] = useState<number>(30);
	const [playerScored, setPlayerScored] = useState<number>(0);

	const [secondsLeft, setSecondsLeft] = useState<number>(15);
	const [secondsLeftUlt, setSecondsLeftUlt] = useState<number>(15);
	const [abilityCooldownImage, setAbilityCooldownImage] = useState<HTMLImageElement>(new Image());
	const [ultimateCooldownImage, setUltimateCooldownImage] = useState<HTMLImageElement>(new Image());

	// Character special abilities
	const [VenomtailSpecial, setVenomtailSpecial] = useState<boolean>(false);
	const [VenomtailTarget, setVenomtailTarget] = useState<number>();
	const [player1Frozen, setPlayer1Frozen] = useState<boolean>();
	const [player2Frozen, setPlayer2Frozen] = useState<boolean>();
	const [raivenSpecial, setRaivenSpecial] = useState<boolean>(false);

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
		var Venomtail:Button = new Button("Venomtail", Character.Venomtail, {x:200, y:100}, {x:30, y:360}, Images.buttonCharVentail, Images.VenomtailSpecial, Images.VenomtailDesc);
		var BelowZero:Button = new Button("BelowZero", Character.BelowZero, {x:200, y:100}, {x:300, y:360}, Images.buttonCharBz, Images.BelowZeroSpecial, Images.BelowZeroDesc);
		var Raiven:Button = new Button("Raiven", Character.Raiven, {x:200, y:100}, {x:300, y:360}, Images.buttonCharRaiven, Images.RaivenSpecial, Images.RaivenDesc);
		if (canvas)
		{
			Venomtail.setSizeLocation({x:300 * canvas.width / 1200, y:150 * canvas.height / 800}, {x:75 * canvas.width / 1200, y:490 * canvas.height / 800});
			BelowZero.setSizeLocation({x:300 * canvas.width / 1200, y:150 * canvas.height / 800}, {x:450 * canvas.width / 1200, y:490 * canvas.height / 800});
			Raiven.setSizeLocation({x:300 * canvas.width / 1200, y:150 * canvas.height / 800}, {x:825 * canvas.width / 1200, y:490 * canvas.height / 800});
		}
		return [Venomtail, BelowZero, Raiven];
	}, [canvas, Images.buttonCharBz, Images.buttonCharRaiven, Images.buttonCharVentail, Images.BelowZeroSpecial, Images.VenomtailSpecial, Images.RaivenSpecial, Images.BelowZeroDesc, Images.VenomtailDesc, Images.RaivenDesc]);

	const handleStartGame = useCallback(() => {
		VenomtailSpecialSound.preload = 'auto';
		BelowZeroSpecialSound.preload = 'auto';
		raivenSpecialSound.preload = 'auto';
		soundGrenadeSound.preload = 'auto';
		VenomtailSpecialSound.load();
		BelowZeroSpecialSound.load();
		raivenSpecialSound.load();
		soundGrenadeSound.load();
		try {
			var opt = new Options(selectedGamemode, selectedPaddle, selectedCharacter, hyperButton.selected, dodgeButton.selected);
			console.log('Socket:', socket);
			socket.current?.emit('start', opt);
		} catch (error) {
		console.error('Failed to start the game:', error);
		}
	}, [selectedCharacter, selectedGamemode, selectedPaddle, hyperButton.selected, dodgeButton.selected, VenomtailSpecialSound, BelowZeroSpecialSound, raivenSpecialSound, soundGrenadeSound]);

	const drawButton = useCallback((ctx: CanvasRenderingContext2D, button: Button, selectedOption: number = -1, radius: number = 20) => {
		const { coordinates, size, image, isFocused, selected, icon } = button;
		const { x, y } = coordinates;
		const { x: width, y: height } = size;
		const otherButtonSelected = selectedOption > -1 && selectedOption !== Mode.Start && selectedOption !== Mode.Reset && !selected;

		ctx.globalAlpha = 1;
		ctx.fillStyle = 'white';
		roundedRect(ctx, x, y, width, height, radius);
		if (selectedOption < Mode.Hyper && image) {
			ctx.drawImage(image, x, y, width, height);
			if (icon) {
				ctx.drawImage(icon, x + width / 2, y + height / 2);
			}
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
		} else if (selected && (!regular || button.id === Mode.Regular || button.id === Mode.Hyper || button.id === Mode.Dodge)) {
			ctx.strokeStyle = "red";
			ctx.lineWidth = 2;
			roundedRect(ctx, x, y, width, height, radius, true);
		} else if (otherButtonSelected || (button.id !== Mode.Regular && button.id < Mode.Hyper && regular && selectedOption !== Mode.Start)) {
			ctx.globalAlpha = 0.5;
			ctx.fillStyle = "black";
			roundedRect(ctx, x, y, width, height, radius);
			ctx.globalAlpha = 1;
		}
	}, [regular]);

	const drawAbilityInfo = useCallback((button: Button, mouseX: number, mouseY: number, ctx: CanvasRenderingContext2D) => {
		ctx.fillStyle = "black";
		ctx.globalAlpha = 0.7;
		roundedRect(ctx, mouseX, mouseY, 200, 100, 15);
		ctx.fillStyle = "white";
		ctx.globalAlpha = 1;
		ctx.font = '15px Arial';
		const descArray = button.description.split("\n");
		let y = mouseY + 100 / (descArray.length + 1);
		for (let item in descArray) {
			ctx.fillText(descArray[item], mouseX + 100, y, 200);
			y += 100 / (descArray.length + 1);
		}
	}, []);

	function mouseOnAbility(buttonX: number, buttonY: number, mouseX: number, mouseY: number) {
		if (mouseX > buttonX + 150 && mouseX < buttonX + 182 && mouseY > buttonY + 75 && mouseY < buttonY + 107)
			return true;
		return false;
	}

	function checkMouseOnButton(button: Button, mouseX: number, mouseY: number) {
		if (mouseX > button.coordinates.x && mouseX < button.coordinates.x + button.size.x &&
			mouseY > button.coordinates.y && mouseY < button.coordinates.y + button.size.y)
			return true;
		return false;
	}

	const handleMouseMove = useCallback((e:MouseEvent) => {
		if (!canvas || !ctx)
			return;
		ctx.fillStyle = backgroundColor;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(Images.headGamemode, canvas.width / 2 - 150, 20, 300, 75);
		ctx.drawImage(Images.headPaddle, canvas.width / 2 - 150, 190, 300, 75);
		ctx.drawImage(Images.headCharacter, canvas.width / 2 - 150, 420, 300, 75);
		const mouseX = e.clientX - canvas.offsetLeft;
		const mouseY = e.clientY - canvas.offsetTop;
		if (checkMouseOnButton(startButton, mouseX, mouseY))
			startButton.isFocused = true;
		else if (startButton.isFocused)
			startButton.isFocused = false;
		drawButton(ctx, startButton, Mode.Start);
		if (checkMouseOnButton(hyperButton, mouseX, mouseY))
			hyperButton.isFocused = true;
		else if (hyperButton.isFocused)
			hyperButton.isFocused = false;
		drawButton(ctx, hyperButton, Mode.Hyper, 5);
		if (checkMouseOnButton(dodgeButton, mouseX, mouseY))
			dodgeButton.isFocused = true;
		else if (dodgeButton.isFocused)
			dodgeButton.isFocused = false;
		drawButton(ctx, dodgeButton, Mode.Dodge, 5);
		for (var index in gamemodeButtons) {
			if (checkMouseOnButton(gamemodeButtons[index], mouseX, mouseY))
				gamemodeButtons[index].isFocused = true;
			else if (gamemodeButtons[index].isFocused === true)
				gamemodeButtons[index].isFocused = false;
			drawButton(ctx, gamemodeButtons[index], selectedGamemode);
		}
		for (index in paddleButtons) {
			if (checkMouseOnButton(paddleButtons[index], mouseX, mouseY))
				paddleButtons[index].isFocused = true;
			else if (paddleButtons[index].isFocused === true)
				paddleButtons[index].isFocused = false;
			drawButton(ctx, paddleButtons[index], selectedPaddle);
		}
		for (index in characterButtons) {
			if (checkMouseOnButton(characterButtons[index], mouseX, mouseY)) {
				characterButtons[index].isFocused = true;
			} else if (characterButtons[index].isFocused === true)
			characterButtons[index].isFocused = false;
			drawButton(ctx, characterButtons[index], selectedCharacter);
			if (mouseOnAbility(characterButtons[index].coordinates.x, characterButtons[index].coordinates.y, mouseX, mouseY))
				drawAbilityInfo(characterButtons[index], mouseX, mouseY, ctx);
		}
	}, [gamemodeButtons, paddleButtons, canvas, ctx, selectedGamemode, drawButton, selectedPaddle, characterButtons, selectedCharacter, startButton, hyperButton, dodgeButton, drawAbilityInfo, Images.headCharacter, Images.headGamemode, Images.headPaddle]);
	
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
		const mouseX = e.clientX - canvas.offsetLeft;
		const mouseY = e.clientY - canvas.offsetTop;
		if (checkMouseOnButton(startButton, mouseX, mouseY)) {
			if ((selectedGamemode !== -1 && selectedPaddle !== -1 && selectedCharacter !== -1) || selectedGamemode === Mode.Regular) {
				if (selectedGamemode !== Mode.Regular) {
					setAbilities(true);
					switch (selectedCharacter) {
						case Character.Venomtail:
							setPlayerUlt(Images.VenomtailSpecial);
							break;
						case Character.BelowZero:
							setPlayerUlt(Images.BelowZeroSpecial);
							break;
						case Character.Raiven:
							setPlayerUlt(Images.RaivenSpecial);
							break;
					}
					if (dodgeButton.selected) {
						setPlayerUlt(Images.RaivenSpecial);
						setMaxTimerAnim(10);
					} else if (hyperButton.selected)
						setMaxTimerAnim(10);
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
		if (checkMouseOnButton(hyperButton, mouseX, mouseY)) {
			if (hyperButton.selected) {
				hyperButton.selected = false;
			} else {
				hyperButton.selected = true;
			}
			drawButton(ctx, hyperButton, Mode.Hyper, 5);
			return;
		}
		if (checkMouseOnButton(dodgeButton, mouseX, mouseY)) {
			if (dodgeButton.selected) {
				dodgeButton.selected = false;
			} else {
				dodgeButton.selected = true;
			}
			drawButton(ctx, dodgeButton, Mode.Dodge, 5);
			return;
		}
		for (var index in gamemodeButtons) {
			if (checkMouseOnButton(gamemodeButtons[index], mouseX, mouseY)) {
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
			if (checkMouseOnButton(paddleButtons[index], mouseX, mouseY)) {
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
			if (checkMouseOnButton(characterButtons[index], mouseX, mouseY)) {
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
	}, [canvas, drawButton, ctx, gamemodeButtons, paddleButtons, handleMouseMove, selectedGamemode, selectedPaddle, characterButtons, selectedCharacter, Images.RaivenSpecial, Images.BelowZeroSpecial, Images.VenomtailSpecial, startButton, clearSelection, regular, hyperButton, dodgeButton]);

	const handleFinishClick = useCallback((e: MouseEvent) => {
		if (!canvas || !ctx)
			return;
		const mouseX = e.clientX - canvas.offsetLeft;
		const mouseY = e.clientY - canvas.offsetTop;
		if (checkMouseOnButton(resetButton, mouseX, mouseY)) {
			setGameSelection(true);
			setBallSize(15);
		}
	}, [canvas, ctx, resetButton]);

	const handleFinishMove = useCallback((e: MouseEvent) => {
		if (!canvas || !ctx)
			return;
		const mouseX = e.clientX - canvas.offsetLeft;
		const mouseY = e.clientY - canvas.offsetTop;
		if (checkMouseOnButton(resetButton, mouseX, mouseY))
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
		else if (event.key === 's')
			socket.current?.emit('randomAbility');
		else if (event.key === 'a')
			socket.current?.emit('specialAbility');
	}, [arrowDown, arrowUp, abilities, arrowLeft, arrowRight, dodgeButton.selected]);

	useEffect(() => {
		socket.current = io('http://localhost:8002');
		socket.current?.emit('loadWindow');
		return () => {
			if (socket.current) {
				socket.current.disconnect();
			}
		};
	}, []);

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
			socket.current.on('scoreUpdate', (event: any) => {
				const { newScore } = event;
				if (newScore.p1 > score.p1) {
					setPlayerScored(1);
				} else {
					setPlayerScored(2);
				}
				setTimeout(() => {
					setPlayerScored(0);
				}, 1000);
				setScore(newScore);
				setAbilityFreeze(false);
				setAbilityMirage(false);
				setPlayer1Frozen(false);
				setPlayer2Frozen(false);
				setRaivenSpecial(false);
				setVenomtailSpecial(false);
				BelowZeroSpecialSound.muted = true;
				VenomtailSpecialSound.muted = true;
				raivenSpecialSound.muted = true;
			});
			socket.current.on('positionsUpdate', (event: any) => {
				const { player1, player2, ball } = event;
				setPlayer1Position(player1);
				setPlayer2Position(player2);
				setBallPosition(ball);
			});
			socket.current.on('positionXUpdate', (event: any) => {
				const { player1X, player2X } = event;
				setPlayer1PositionX(player1X);
				setPlayer2PositionX(player2X);
			});
			socket.current.on('winnerUpdate', (event: any) => {
				const { winner } = event;
				setWinner(winner);
				setScore({p1: 0, p2: 0});
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
				// Ability timers
				socket.current.on('secondsLeft', (event: any) => {
					const { secondsLeft } = event;
					setSecondsLeft(secondsLeft);
				});
				socket.current.on('secondsLeftUlt', (event: any) => {
					const { secondsLeftUlt } = event;
					setSecondsLeftUlt(secondsLeftUlt);
				});
				// Character special abilities
				socket.current.on('VenomtailSpecial', (event: any) => {
					const { VenomtailSpecial, target } = event;
					setVenomtailSpecial(VenomtailSpecial);
					setVenomtailTarget(target);
					VenomtailSpecialSound.muted = false;
					VenomtailSpecialSound.play();
				});
				socket.current.on('BelowZeroSpecial', (event: any) => {
					const { target } = event;
					if (target === -1) {
						setPlayer1Frozen(false);
					} else if (target === -2) {
						setPlayer2Frozen(false);
					} else if (target === 1) {
						setPlayer1Frozen(true);
						BelowZeroSpecialSound.muted = false;
						BelowZeroSpecialSound.play();
					} else if (target === 2) {
						setPlayer2Frozen(true);
						BelowZeroSpecialSound.muted = false;
						BelowZeroSpecialSound.play();
					}
				});
				socket.current.on('RaivenSpecial', (event: any) => {
					const { RaivenSpecial } = event;
					setRaivenSpecial(RaivenSpecial);
					if (RaivenSpecial) {
						raivenSpecialSound.muted = false;
						raivenSpecialSound.play();
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
					if (!hasAbility) {
						setAbilityCooldownImage(Images.Cooldown[0]);
						var animFrame = 1;
						const abilTimer = setInterval(() => {
							setAbilityCooldownImage(Images.Cooldown[animFrame % Images.Cooldown.length]);
							animFrame++;
							if (animFrame >= maxTimerAnim)
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
							if (dodgeButton.selected)
								setPlayerAbility(Images.HomingAbility);
							else
								setPlayerAbility(Images.DeflectAbility);
							break;
					}
				});
				socket.current.on('hasUlt', (event: any) => {
					const { hasUlt } = event;
					setHasUlt(hasUlt);
					if (!hasUlt) {
						setUltimateCooldownImage(Images.Cooldown[0]);
						var animFrame = 1;
						let ultTimer = setInterval(() => {
							setUltimateCooldownImage(Images.Cooldown[animFrame % Images.Cooldown.length]);
							animFrame++;
							if (animFrame >= maxTimerAnim)
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
						case Character.Venomtail:
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
								case Character.BelowZero:
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
						case Character.Raiven:
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
						case Character.Venomtail:
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
						case Character.BelowZero:
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
						case Character.Raiven:
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
					socket.current?.off('scoreUpdate');
					socket.current?.off('gameInit');
					socket.current?.off('mirageUpdate');
					socket.current?.off('AbilityMirage');
					socket.current?.off('SoundGrenade');
					socket.current?.off('BallSize');
					socket.current?.off('VenomtailSpecial');
					socket.current?.off('BelowZeroSpecial');
					socket.current?.off('RaivenSpecial');
				};
			}
			return () => {
				socket.current?.off('gameStatus');
				socket.current?.off('winnerUpdate');
				socket.current?.off('scoreUpdate');
				socket.current?.off('gameInit');
			}
		}
	}, [abilities, hasAbility, Images.BiggerBallAbility, Images.MirageAbility, Images.SmallerBallAbility, Images.FreezeAbility, Images.SoundGrenadeAbility, player, VenomtailSpecialSound, soundGrenadeSound, Images.paddleBzL, Images.paddleBzM, Images.paddleBzS, Images.paddleVentailL, Images.paddleVentailM, Images.paddleVentailS, Images.paddleRaivenL, Images.paddleRaivenM, Images.paddleRaivenS, Images.Cooldown, secondsLeft, Images.HomingAbility, dodgeButton, BelowZeroSpecialSound, raivenSpecialSound, maxTimerAnim, score.p1, Images.DeflectAbility]);

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

	useEffect(() => {
		if (canvas) {
			if (ctx) {
				if (isGameStarted) {
					ctx.fillStyle = backgroundColor;
					if (raivenSpecial) {
						ctx.fillRect(10, player1Position - 10, 20, 120);
						ctx.globalAlpha = 0.1;
					}
					ctx.fillRect(0, 0, canvas.width, canvas.height);
					ctx.fillStyle = 'white';
					ctx.globalAlpha = 1;
					if (playerScored > 0) {
						ctx.fillStyle = "red";
						if (playerScored === 2) {
							ctx.fillRect(0, 0, 7, canvas.height);
						} else {
							ctx.fillRect(1193, 0, 7, canvas.height);
						}
					}
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
							ctx.drawImage(Images.iceBlock, player1PositionX - 5, player1Position - 10, player1Size.width + 10, player1Size.height + 20);
							ctx.globalAlpha = 1;
					}
					if (player2Frozen) {
						ctx.globalAlpha = 0.50;
						ctx.drawImage(Images.iceBlock, player2PositionX - 5, player2Position - 10, player2Size.width + 10, player2Size.height + 20);
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

						if (raivenSpecial) {
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
				
						// Draw the line to the ball, when Venomtail ability is used
						if (VenomtailSpecial) {
							// Draw a line between two points
							ctx.beginPath();
							if (VenomtailTarget === 1)
								ctx.moveTo(player1Size.width + 10, player1Position + player1Size.height / 2);
							else if (VenomtailTarget === 2)
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
					ctx.font = 'bold 40px Arial';
					let timer: NodeJS.Timeout;
					if (winner === player) {
						ctx.fillStyle = 'white';
						ctx.fillText("You have reached transcendence", 600, 200);
						ctx.drawImage(endScreen.Mountains, 100, 300);
						ctx.drawImage(endScreen.Cloud1, endScreen.c1x, 430);
						ctx.drawImage(endScreen.Cloud2, endScreen.c2x, 535);
						ctx.drawImage(endScreen.Cloud3, endScreen.c3x, 370);
						timer = setInterval(() => {
							ctx.fillStyle = grd;
							ctx.fillRect(0, 0, canvas.width, canvas.height);
							if (endScreen.c1behind && endScreen.c1x > endScreen.c1min) {
								endScreen.c1x -= 1;
								ctx.drawImage(endScreen.Cloud1, endScreen.c1x, 430);
							}
							if (endScreen.c2behind && endScreen.c2x < endScreen.c2max) {
								endScreen.c2x += 1;
								ctx.drawImage(endScreen.Cloud2, endScreen.c2x, 535);
							}
							if (endScreen.c3behind && endScreen.c3x > endScreen.c3min) {
								endScreen.c3x -= 1;
								ctx.drawImage(endScreen.Cloud3, endScreen.c3x, 370);
							}
							ctx.drawImage(endScreen.Mountains, 100, 300);
							if (!endScreen.c1behind && endScreen.c1x < endScreen.c1max) {
								endScreen.c1x += 1;
								ctx.drawImage(endScreen.Cloud1, endScreen.c1x, 430);
							}
							if (!endScreen.c2behind && endScreen.c2x > endScreen.c2min) {
								endScreen.c2x -= 1;
								ctx.drawImage(endScreen.Cloud2, endScreen.c2x, 535);
							}
							if (!endScreen.c3behind && endScreen.c3x < endScreen.c3max) {
								endScreen.c3x += 1;
								ctx.drawImage(endScreen.Cloud3, endScreen.c3x, 370);
							}
							ctx.fillStyle = 'white';
							ctx.fillText("You have reached transcendence", 600, 200);
							drawButton(ctx, resetButton, Mode.Reset);
							if (endScreen.c1x === endScreen.c1max || endScreen.c1x === endScreen.c1min)
								endScreen.c1behind = !endScreen.c1behind;
							if (endScreen.c2x === endScreen.c2max || endScreen.c2x === endScreen.c2min)
								endScreen.c2behind = !endScreen.c2behind;
							if (endScreen.c3x === endScreen.c3max || endScreen.c3x === endScreen.c3min)
								endScreen.c3behind = !endScreen.c3behind;
						}, 100);
						drawButton(ctx, resetButton, Mode.Reset);
					} else {
						ctx.fillStyle = 'black';
						ctx.fillText("Player " + winner + " reaches transcendence, leaving you in the dust.", 600, 200);
						ctx.drawImage(endScreen.Mountains, 100, 300);
						ctx.drawImage(endScreen.Cloud1, endScreen.c1x, 430);
						ctx.drawImage(endScreen.Cloud2, endScreen.c2x, 535);
						ctx.drawImage(endScreen.Cloud3, endScreen.c3x, 370);
						timer = setInterval(() => {
							ctx.fillStyle = grd;
							ctx.fillRect(0, 0, canvas.width, canvas.height);
							if (endScreen.c1behind && endScreen.c1x > endScreen.c1min) {
								endScreen.c1x -= 1;
								if (endScreen.c1LightningActive) {
									ctx.drawImage(endScreen.lightningImage, endScreen.lightningPosition, 505, 60, 180);
								}
								ctx.drawImage(endScreen.Cloud1, endScreen.c1x, 430);
							}
							if (endScreen.c2behind && endScreen.c2x < endScreen.c2max) {
								endScreen.c2x += 1;
								if (endScreen.c2LightningActive) {
									ctx.drawImage(endScreen.lightningImage, endScreen.lightningPosition, 574, 30, 90);
								}
								ctx.drawImage(endScreen.Cloud2, endScreen.c2x, 535);
							}
							if (endScreen.c3behind && endScreen.c3x > endScreen.c3min) {
								endScreen.c3x -= 1;
								if (endScreen.c3LightningActive) {
									ctx.drawImage(endScreen.lightningImage, endScreen.lightningPosition, 411, 30, 90);
								}
								ctx.drawImage(endScreen.Cloud3, endScreen.c3x, 370);
							}
							ctx.drawImage(endScreen.Mountains, 100, 300);
							if (!endScreen.c1behind && endScreen.c1x < endScreen.c1max) {
								endScreen.c1x += 1;
								if (endScreen.c1LightningActive) {
									ctx.drawImage(endScreen.lightningImage, endScreen.lightningPosition, 505, 60, 180);
								}
								ctx.drawImage(endScreen.Cloud1, endScreen.c1x, 430);
							}
							if (!endScreen.c2behind && endScreen.c2x > endScreen.c2min) {
								endScreen.c2x -= 1;
								if (endScreen.c2LightningActive) {
									ctx.drawImage(endScreen.lightningImage, endScreen.lightningPosition, 574, 30, 90);
								}
								ctx.drawImage(endScreen.Cloud2, endScreen.c2x, 535);
							}
							if (!endScreen.c3behind && endScreen.c3x < endScreen.c3max) {
								endScreen.c3x += 1;
								if (endScreen.c3LightningActive) {
									ctx.drawImage(endScreen.lightningImage, endScreen.lightningPosition, 411, 30, 90);
								}
								ctx.drawImage(endScreen.Cloud3, endScreen.c3x, 370);
							}
							ctx.fillStyle = 'black';
							ctx.fillText("Player " + winner + " reaches transcendence, leaving you in the dust.", 600, 200);
							drawButton(ctx, resetButton, Mode.Reset);
							if (endScreen.c1x === endScreen.c1max || endScreen.c1x === endScreen.c1min)
								endScreen.c1behind = !endScreen.c1behind;
							if (endScreen.c2x === endScreen.c2max || endScreen.c2x === endScreen.c2min)
								endScreen.c2behind = !endScreen.c2behind;
							if (endScreen.c3x === endScreen.c3max || endScreen.c3x === endScreen.c3min)
								endScreen.c3behind = !endScreen.c3behind;
							endScreen.lightningCounter++;
							if (endScreen.lightningCounter === 50) {
								endScreen.lightningCounter = 0;
								switch (Math.floor(Math.random() * 4)) {
									case 0:
										endScreen.lightningImage = endScreen.Lightning1;
										break;
									case 1:	
										endScreen.lightningImage = endScreen.Lightning2;
										break;	
									case 2:
										endScreen.lightningImage = endScreen.Lightning3;
										break;
									case 3:
										endScreen.lightningImage = endScreen.Lightning4;
										break;
								}
								switch (Math.floor(Math.random() * 3)) {
									case 0:
										endScreen.lightningPosition = endScreen.c1x + 20 + Math.random() * 200;
										endScreen.c1LightningActive = true;
										break;
									case 1:
										endScreen.lightningPosition = endScreen.c2x + 27 + Math.random() * 80;
										endScreen.c2LightningActive = true;
										break;
									case 2:
										endScreen.lightningPosition = endScreen.c3x + 23 + Math.random() * 42;
										endScreen.c3LightningActive = true;
										break;
								}
							} else if (endScreen.lightningCounter === 5) {
								endScreen.c1LightningActive = false;
								endScreen.c2LightningActive = false;
								endScreen.c3LightningActive = false;
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
	}, [player1Position, player2Position, ballPosition, VenomtailSpecial, score, winner, ballSize, drawButton, isGameStarted, gamemodeButtons, canvas, ctx, handleMouseMove, Images.iceBlock, abilityMirage, miragePos, paddleButtons, selectedGamemode, selectedPaddle, abilityFreeze, characterButtons, selectedCharacter, raivenSpecial, abilities, hasAbility, Images.healthText, Images.icon, Images.iconBackground, Images.left_bar, Images.left_health, Images.mid_bar, Images.mid_health, Images.right_bar, Images.right_health, player1Character, player2Character, secondsLeft, hasUlt, player1Size, playerAbility, playerUlt, secondsLeftUlt, player2Size.height, player2Size.width, VenomtailTarget, Images.headGamemode, startButton, Images, isPlayerWaiting, isGameSelection, isGameInit, player1Frozen, player2Frozen, player, abilityCooldownImage, ultimateCooldownImage, resetButton, handleFinishClick, handleFinishMove, hyperButton, dodgeButton, playerChose, handleStartGame, player1PositionX, player2PositionX, playerScored, endScreen]);


	return (
		<div>
		<canvas ref={canvasRef} width={1200} height={800} style={{ backgroundColor: 'black', marginRight: '50' }}></canvas>
		</div>
	);
};

export default GameComponent;
