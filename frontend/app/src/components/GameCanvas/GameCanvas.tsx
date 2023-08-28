import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import axios from "axios";
import { Socket } from "socket.io-client";
import { Button, Options, ImageContainer } from "./Canvas";
import GetOverHere from "../../sounds/getOverHere.mp3";
import IceSound from "../../sounds/IceSound.mp3";
import LightningSound from "../../sounds/LightningSound.mp3";
import SoundGrenade from "../../sounds/sound_grenade.mp3";
import { Mode } from "./enums/Modes";
import { Paddles } from "./enums/Paddles";
import { Character } from "./enums/Characters";
import { EndScreen } from "./Canvas";
import { getUserID } from "../../utils/Utils";

axios.defaults.baseURL = process.env.REACT_APP_BACKEND;

type GameComponentProps = {
  socket: Socket;
};

const GameComponent: React.FC<GameComponentProps> = ({ socket }) => {
  const [, setUserID] = useState<string>("");

  const VenomtailSpecialSound = useMemo(() => new Audio(GetOverHere), []);
  const BelowZeroSpecialSound = useMemo(() => new Audio(IceSound), []);
  const raivenSpecialSound = useMemo(() => new Audio(LightningSound), []);
  const soundGrenadeSound = useMemo(() => new Audio(SoundGrenade), []);

  const Images = useMemo(() => new ImageContainer(), []);
  const endScreen = useMemo(() => new EndScreen(), []);
  const [player, setPlayer] = useState<number>();
  const [player1Name, setPlayer1Name] = useState<string>("");
  const [player2Name, setPlayer2Name] = useState<string>("");
  const [player1Size, setPlayer1Size] = useState<{
    width: number;
    height: number;
  }>({ width: 20, height: 100 });
  const [player2Size, setPlayer2Size] = useState<{
    width: number;
    height: number;
  }>({ width: 20, height: 100 });
  const [player1Position, setPlayer1Position] = useState<number>(350);
  const [player2Position, setPlayer2Position] = useState<number>(350);
  const [player1PositionX, setPlayer1PositionX] = useState<number>(20);
  const [player2PositionX, setPlayer2PositionX] = useState<number>(1160);
  const [player1Character, setPlayer1Character] = useState<HTMLImageElement>(
    new Image()
  );
  const [player2Character, setPlayer2Character] = useState<HTMLImageElement>(
    new Image()
  );
  const [playerAbility, setPlayerAbility] = useState<HTMLImageElement>(
    new Image()
  );
  const [playerUlt, setPlayerUlt] = useState<HTMLImageElement>(new Image());
  const [ballPosition, setBallPosition] = useState<{ x: number; y: number }>({
    x: 600,
    y: 400,
  });
  const [ballSize, setBallSize] = useState<number>(15);
  const [isGameSelection, setGameSelection] = useState<boolean>(true);
  const [isGameStarted, setGameStarted] = useState<boolean>(false);
  const [playerChose, setPlayerChose] = useState<boolean>(false);
  const [isPlayerWaiting, setPlayerWaiting] = useState<boolean>(false);
  const [isGameInit, setGameInit] = useState<boolean>(false);
  const [winner, setWinner] = useState<number>(-1);
  const [result, setResult] = useState<number>(0);
  const [winnerName, setWinnerName] = useState<string>("");
  const [score, setScore] = useState<{ p1: number; p2: number }>({
    p1: 0,
    p2: 0,
  });
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
  const [abilityCooldown, setAbilityCooldown] = useState<boolean>(false);
  const [ultimateCooldown, setUltimateCooldown] = useState<boolean>(false);
  const [abilityCooldownImage, setAbilityCooldownImage] =
    useState<HTMLImageElement>(new Image());
  const [ultimateCooldownImage, setUltimateCooldownImage] =
    useState<HTMLImageElement>(new Image());

  // Character special abilities
  const [VenomtailSpecial, setVenomtailSpecial] = useState<boolean>(false);
  const [VenomtailTarget, setVenomtailTarget] = useState<number>();
  const [player1Frozen, setPlayer1Frozen] = useState<boolean>();
  const [player2Frozen, setPlayer2Frozen] = useState<boolean>();
  const [raivenSpecial, setRaivenSpecial] = useState<boolean>(false);

  // Regular random abilities
  const [abilityFreeze, setAbilityFreeze] = useState<boolean>(false);
  const [abilityMirage, setAbilityMirage] = useState<boolean>(false);
  const [player1Mirage, setPlayer1Mirage] = useState<boolean>(false);
  const [player2Mirage, setPlayer2Mirage] = useState<boolean>(false);

  const [miragePos, setMiragePos] = useState([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // const socket = useRef<Socket | null>(null);
  const canvas = canvasRef;
  const ctx = canvas?.current?.getContext("2d");

  const [selectedGamemode, setSelectedGamemode] = useState<number>(-1);
  const [selectedPaddle, setSelectedPaddle] = useState<number>(-1);
  const [selectedCharacter, setSelectedCharacter] = useState<number>(-1);
  const [regular, setRegular] = useState<boolean>(false);
  const [chooseText, setChooseText] = useState<boolean>(false);
  const [, setRender] = useState<boolean>(false);

  const backgroundColor = "rgb(100, 100, 100)";

  const startButton = useMemo(() => {
    var GameStart: Button = new Button(
      "Start Game",
      Mode.Start,
      { x: 300, y: 75 },
      { x: 450, y: 670 },
      Images.buttonStart
    );
    return GameStart;
  }, [Images.buttonStart]);

  const resetButton = useMemo(() => {
    var Reset: Button = new Button(
      "Return to Game Menu",
      Mode.Reset,
      { x: 150, y: 50 },
      { x: 1040, y: 10 },
      Images.buttonMenu
    );
    return Reset;
  }, [Images.buttonMenu]);

  const hyperButton = useMemo(() => {
    var Hyper: Button = new Button(
      "Enable HyperMode",
      Mode.Hyper,
      { x: 25, y: 25 },
      { x: 850, y: 695 },
      undefined
    );
    return Hyper;
  }, []);

  const dodgeButton = useMemo(() => {
    var Dodge: Button = new Button(
      "Grab life by the ball",
      Mode.Dodge,
      { x: 25, y: 25 },
      { x: 850, y: 740 },
      undefined
    );
    return Dodge;
  }, []);

  const gamemodeButtons = useMemo(() => {
    var Singleplayer: Button = new Button(
      "Singleplayer",
      Mode.Singleplayer,
      { x: 300, y: 75 },
      { x: 75, y: 100 },
      Images.buttonModeSingle,
      null,
      "Play against a bot\nA - Special Ability\nS - Regular Ability\nC - Clear Ability"
    );
    var MasterOfPong: Button = new Button(
      "Master Of Pong",
      Mode.MasterOfPong,
      { x: 300, y: 75 },
      { x: 450, y: 100 },
      Images.buttonModeMaster,
      null,
      "Play against another player\nA - Special Ability\nS - Regular Ability\nC - Clear Ability"
    );
    var RegularPong: Button = new Button(
      "Regular",
      Mode.Regular,
      { x: 300, y: 75 },
      { x: 825, y: 100 },
      Images.buttonModeRegular,
      null,
      "Play standard Pong\nwith no abilities"
    );
    return [Singleplayer, MasterOfPong, RegularPong];
  }, [
    Images.buttonModeMaster,
    Images.buttonModeRegular,
    Images.buttonModeSingle,
  ]);

  const paddleButtons = useMemo(() => {
    var SmallPaddle: Button = new Button(
      "Small",
      Paddles.Small,
      { x: 300, y: 150 },
      { x: 75, y: 260 },
      Images.buttonPaddleSmall
    );
    var RegularPaddle: Button = new Button(
      "Average Joe",
      Paddles.AverageJoe,
      { x: 300, y: 150 },
      { x: 450, y: 260 },
      Images.buttonPaddleRegular
    );
    var BigPaddle: Button = new Button(
      "Big Pete",
      Paddles.BigPete,
      { x: 300, y: 150 },
      { x: 825, y: 260 },
      Images.buttonPaddleBig
    );
    return [SmallPaddle, RegularPaddle, BigPaddle];
  }, [
    Images.buttonPaddleBig,
    Images.buttonPaddleRegular,
    Images.buttonPaddleSmall,
  ]);

  const characterButtons = useMemo(() => {
    var Venomtail: Button = new Button(
      "Venomtail",
      Character.Venomtail,
      { x: 300, y: 150 },
      { x: 75, y: 490 },
      Images.buttonCharVentail,
      Images.VenomtailSpecial,
      Images.VenomtailDesc
    );
    var BelowZero: Button = new Button(
      "BelowZero",
      Character.BelowZero,
      { x: 300, y: 150 },
      { x: 450, y: 490 },
      Images.buttonCharBz,
      Images.BelowZeroSpecial,
      Images.BelowZeroDesc
    );
    var Raiven: Button = new Button(
      "Raiven",
      Character.Raiven,
      { x: 300, y: 150 },
      { x: 825, y: 490 },
      Images.buttonCharRaiven,
      Images.RaivenSpecial,
      Images.RaivenDesc
    );
    return [Venomtail, BelowZero, Raiven];
  }, [
    Images.buttonCharBz,
    Images.buttonCharRaiven,
    Images.buttonCharVentail,
    Images.BelowZeroSpecial,
    Images.VenomtailSpecial,
    Images.RaivenSpecial,
    Images.BelowZeroDesc,
    Images.VenomtailDesc,
    Images.RaivenDesc,
  ]);

  const handleStartGame = useCallback(() => {
    VenomtailSpecialSound.preload = "auto";
    BelowZeroSpecialSound.preload = "auto";
    raivenSpecialSound.preload = "auto";
    soundGrenadeSound.preload = "auto";
    VenomtailSpecialSound.load();
    BelowZeroSpecialSound.load();
    raivenSpecialSound.load();
    soundGrenadeSound.load();
    try {
      var opt = new Options(
        selectedGamemode,
        selectedPaddle,
        selectedCharacter,
        hyperButton.selected,
        dodgeButton.selected
      );
      socket.emit("start", {
        opt: opt,
        token: getToken(process.env.REACT_APP_JWT_NAME as string),
      });
    } catch (error) {
      console.error("Failed to start the game:", error);
    }
  }, [
    selectedCharacter,
    selectedGamemode,
    selectedPaddle,
    hyperButton.selected,
    dodgeButton.selected,
    VenomtailSpecialSound,
    BelowZeroSpecialSound,
    raivenSpecialSound,
    soundGrenadeSound,
    socket,
  ]);

  function getToken(tokenName: string): string | null {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(tokenName + "=")) {
        return cookie.substring(tokenName.length + 1);
      }
    }
    return null;
  }
  const drawButton = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      button: Button,
      selectedOption: number = -1,
      radius: number = 20
    ) => {
      const { coordinates, size, image, isFocused, selected, icon } = button;
      const { x, y } = coordinates;
      const { x: width, y: height } = size;
      const otherButtonSelected =
        selectedOption > -1 &&
        selectedOption !== Mode.Start &&
        selectedOption !== Mode.Reset &&
        !selected;

      ctx.globalAlpha = 1;
      ctx.fillStyle = "white";
      roundedRect(ctx, x, y, width, height, radius);
      if (selectedOption < Mode.Hyper && image) {
        ctx.drawImage(image, x, y, width, height);
        if (icon) {
          ctx.drawImage(icon, x + width / 2, y + height / 2);
        }
      } else {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(x - 2, y - 2, width + 190, height + 4);
        ctx.fillStyle = "black";
        ctx.font = "20px Arial";
        ctx.fillText(button.name, x + 120, y + 14);
      }
      if (
        !isFocused &&
        ((!selected && !otherButtonSelected && !regular) ||
          selectedOption === Mode.Start)
      ) {
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = "black";
        roundedRect(ctx, x, y, width, height, radius);
        ctx.globalAlpha = 1;
      } else if (
        selected &&
        (!regular ||
          button.id === Mode.Regular ||
          button.id === Mode.Hyper ||
          button.id === Mode.Dodge)
      ) {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        roundedRect(ctx, x, y, width, height, radius, true);
      } else if (
        otherButtonSelected ||
        (button.id !== Mode.Regular &&
          button.id < Mode.Hyper &&
          regular &&
          selectedOption !== Mode.Start)
      ) {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "black";
        roundedRect(ctx, x, y, width, height, radius);
        ctx.globalAlpha = 1;
      }
    },
    [regular]
  );

  const drawAbilityInfo = useCallback(
    (
      button: Button,
      mouseX: number,
      mouseY: number,
      ctx: CanvasRenderingContext2D
    ) => {
      ctx.fillStyle = "black";
      ctx.globalAlpha = 0.7;
      roundedRect(ctx, mouseX, mouseY, 200, 100, 15);
      ctx.fillStyle = "white";
      ctx.globalAlpha = 1;
      ctx.font = "15px Arial";
      const descArray = button.description.split("\n");
      let y = mouseY + 100 / (descArray.length + 1);
      for (let item in descArray) {
        ctx.fillText(descArray[item], mouseX + 100, y, 200);
        y += 100 / (descArray.length + 1);
      }
    },
    []
  );

  function mouseOnAbility(
    buttonX: number,
    buttonY: number,
    mouseX: number,
    mouseY: number
  ) {
    if (
      mouseX > buttonX + 150 &&
      mouseX < buttonX + 182 &&
      mouseY > buttonY + 75 &&
      mouseY < buttonY + 107
    )
      return true;
    return false;
  }

  function checkMouseOnButton(button: Button, mouseX: number, mouseY: number) {
    if (
      mouseX > button.coordinates.x &&
      mouseX < button.coordinates.x + button.size.x &&
      mouseY > button.coordinates.y &&
      mouseY < button.coordinates.y + button.size.y
    )
      return true;
    return false;
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!canvas.current || !ctx) return;
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, 1200, 800);
      ctx.drawImage(Images.headGamemode, 450, 20, 300, 75);
      ctx.drawImage(Images.headPaddle, 450, 190, 300, 75);
      ctx.drawImage(Images.headCharacter, 450, 420, 300, 75);
      if (chooseText) {
        ctx.fillStyle = "black";
        ctx.font = "30px Arial"; //ITC Zapf Chancery
        ctx.fillText("Choose game settings to continue", 600, 770);
      }
      const mouseX = e.clientX - canvas.current.offsetLeft;
      const mouseY = e.clientY - (canvas.current.offsetTop + 72);
      if (checkMouseOnButton(startButton, mouseX, mouseY))
        startButton.isFocused = true;
      else if (startButton.isFocused) startButton.isFocused = false;
      drawButton(ctx, startButton, Mode.Start);
      if (checkMouseOnButton(hyperButton, mouseX, mouseY))
        hyperButton.isFocused = true;
      else if (hyperButton.isFocused) hyperButton.isFocused = false;
      drawButton(ctx, hyperButton, Mode.Hyper, 5);
      if (checkMouseOnButton(dodgeButton, mouseX, mouseY))
        dodgeButton.isFocused = true;
      else if (dodgeButton.isFocused) dodgeButton.isFocused = false;
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
        if (
          mouseOnAbility(
            characterButtons[index].coordinates.x,
            characterButtons[index].coordinates.y,
            mouseX,
            mouseY
          )
        )
          drawAbilityInfo(characterButtons[index], mouseX, mouseY, ctx);
      }
      for (index in gamemodeButtons) {
        if (gamemodeButtons[index].isFocused) {
          drawAbilityInfo(
            gamemodeButtons[index],
            gamemodeButtons[index].coordinates.x + 50,
            gamemodeButtons[index].coordinates.y +
              gamemodeButtons[index].size.y,
            ctx
          );
        }
      }
    },
    [
      gamemodeButtons,
      paddleButtons,
      canvas,
      ctx,
      selectedGamemode,
      drawButton,
      selectedPaddle,
      characterButtons,
      selectedCharacter,
      startButton,
      hyperButton,
      dodgeButton,
      drawAbilityInfo,
      Images.headCharacter,
      Images.headGamemode,
      Images.headPaddle,
      chooseText,
    ]
  );

  const clearSelection = useCallback(() => {
    for (var index in paddleButtons) {
      if (paddleButtons[index].selected) paddleButtons[index].selected = false;
    }
    setSelectedPaddle(-1);
    for (index in characterButtons) {
      if (characterButtons[index].selected)
        characterButtons[index].selected = false;
    }
    setSelectedCharacter(-1);
  }, [characterButtons, paddleButtons]);

  const handleMouseClick = useCallback(
    (e: MouseEvent) => {
      if (!canvas.current || !ctx) return;
      const mouseX = e.clientX - canvas.current.offsetLeft;
      const mouseY = e.clientY - (canvas.current.offsetTop + 72);
      if (checkMouseOnButton(startButton, mouseX, mouseY)) {
        if (
          (selectedGamemode !== -1 &&
            selectedPaddle !== -1 &&
            selectedCharacter !== -1) ||
          selectedGamemode === Mode.Regular
        ) {
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
            } else if (hyperButton.selected) setMaxTimerAnim(10);
          }
          setPlayerChose(true);
          setGameSelection(false);
          canvas.current.removeEventListener("mousemove", handleMouseMove);
          canvas.current.removeEventListener("click", handleMouseClick);
          return;
        } else {
          setChooseText(true);
          ctx.font = "30px Arial"; //ITC Zapf Chancery
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
          setChooseText(false);
          if (selectedGamemode !== -1) {
            if (gamemodeButtons[index].selected) {
              gamemodeButtons[index].selected = false;
              if (gamemodeButtons[index].id === Mode.Regular) setRegular(false);
              setSelectedGamemode(-1);
            } else {
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
          } else {
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
          setChooseText(false);
          if (!regular) {
            if (selectedPaddle !== -1) {
              if (paddleButtons[index].selected) {
                paddleButtons[index].selected = false;
                setSelectedPaddle(-1);
              } else {
                for (button in paddleButtons) {
                  if (paddleButtons[button].selected) {
                    paddleButtons[button].selected = false;
                    paddleButtons[index].selected = true;
                    setSelectedPaddle(paddleButtons[index].id);
                  }
                }
              }
            } else {
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
          setChooseText(false);
          if (!regular) {
            if (selectedCharacter !== -1) {
              if (characterButtons[index].selected) {
                characterButtons[index].selected = false;
                setSelectedCharacter(-1);
              } else {
                for (button in characterButtons) {
                  if (characterButtons[button].selected) {
                    characterButtons[button].selected = false;
                    characterButtons[index].selected = true;
                    setSelectedCharacter(characterButtons[index].id);
                  }
                }
              }
            } else {
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
    },
    [
      canvas,
      drawButton,
      ctx,
      gamemodeButtons,
      paddleButtons,
      handleMouseMove,
      selectedGamemode,
      selectedPaddle,
      characterButtons,
      selectedCharacter,
      Images.RaivenSpecial,
      Images.BelowZeroSpecial,
      Images.VenomtailSpecial,
      startButton,
      clearSelection,
      regular,
      hyperButton,
      dodgeButton,
    ]
  );

  const handleFinishClick = useCallback(
    (e: MouseEvent) => {
      if (!canvas.current || !ctx) return;
      const mouseX = e.clientX - canvas.current.offsetLeft;
      const mouseY = e.clientY - (canvas.current.offsetTop + 82);
      if (checkMouseOnButton(resetButton, mouseX, mouseY)) {
        setGameSelection(true);
        setGameInit(false);
        setGameStarted(false);
        setPlayerWaiting(false);
        switch (selectedGamemode) {
          case Mode.Singleplayer:
            gamemodeButtons[0].selected = true;
            break;
          case Mode.MasterOfPong:
            gamemodeButtons[1].selected = true;
            break;
          case Mode.Regular:
            gamemodeButtons[2].selected = true;
            break;
        }
        setBallSize(15);
        setBallPosition({ x: 600, y: 400 });
        setWinner(0);
        setResult(0);
        setAbilities(false);
      }
    },
    [canvas, ctx, resetButton, gamemodeButtons, selectedGamemode]
  );

  const handleLeaveClick = useCallback(
    (e: MouseEvent) => {
      if (!canvas.current || !ctx) return;
      const mouseX = e.clientX - canvas.current.offsetLeft;
      const mouseY = e.clientY - (canvas.current.offsetTop + 82);
      if (checkMouseOnButton(resetButton, mouseX, mouseY)) {
        socket.emit("leaveQueue");
        setGameSelection(true);
        setGameInit(false);
        setGameStarted(false);
        setPlayerWaiting(false);
        switch (selectedGamemode) {
          case Mode.Singleplayer:
            gamemodeButtons[0].selected = true;
            break;
          case Mode.MasterOfPong:
            gamemodeButtons[1].selected = true;
            break;
          case Mode.Regular:
            gamemodeButtons[2].selected = true;
            break;
        }
        setBallSize(15);
        setBallPosition({ x: 600, y: 400 });
        setWinner(0);
        setResult(0);
        setAbilities(false);
      }
    },
    [canvas, ctx, resetButton, gamemodeButtons, selectedGamemode, socket]
  );

  const handleFinishMove = useCallback(
    (e: MouseEvent) => {
      if (!canvas.current || !ctx) return;
      const mouseX = e.clientX - canvas.current.offsetLeft;
      const mouseY = e.clientY - (canvas.current.offsetTop + 82);
      if (checkMouseOnButton(resetButton, mouseX, mouseY))
        resetButton.isFocused = true;
      else if (resetButton.isFocused) resetButton.isFocused = false;
      drawButton(ctx, resetButton, Mode.Reset);
    },
    [canvas, ctx, drawButton, resetButton]
  );

  function roundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    clear: boolean = false
  ) {
    ctx.beginPath();
    ctx.moveTo(x, y + radius);
    ctx.arcTo(x, y + height, x + radius, y + height, radius);
    ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
    ctx.arcTo(x + width, y, x + width - radius, y, radius);
    ctx.arcTo(x, y, x, y + radius, radius);
    if (clear) ctx.stroke();
    else ctx.fill();
  }

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      const stopPressUp = async () => {
        try {
          socket.emit("moveUpDisable");
        } catch (error) {
          console.error("Failed to stop moving the paddle up:", error);
        }
      };
      const stopPressDown = async () => {
        try {
          socket.emit("moveDownDisable");
        } catch (error) {
          console.error("Failed to stop moving the paddle down:", error);
        }
      };
      if (event.key === "ArrowUp") {
        stopPressUp();
        setArrowUp(false);
      } else if (event.key === "ArrowDown") {
        stopPressDown();
        setArrowDown(false);
      }
      if (dodgeButton.selected && event.key === "ArrowLeft") {
        try {
          socket.emit("moveDisable", 1);
          setArrowLeft(false);
        } catch (error) {
          console.error("Failed to stop moving the paddle left:", error);
        }
      } else if (dodgeButton.selected && event.key === "ArrowRight") {
        try {
          socket.emit("moveDisable", 2);
          setArrowRight(false);
        } catch (error) {
          console.error("Failed to stop moving the paddle right:", error);
        }
      }
    },
    [dodgeButton.selected, socket]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const moveUp = async () => {
        try {
          socket.emit("moveUpEnable");
        } catch (error) {
          console.error("Failed to move the paddle up:", error);
        }
      };

      const moveDown = async () => {
        try {
          socket.emit("moveDownEnable");
        } catch (error) {
          console.error("Failed to move the paddle down:", error);
        }
      };

      if (event.key === "ArrowUp" && !arrowUp) {
        setArrowUp(true);
        moveUp();
      } else if (event.key === "ArrowDown" && !arrowDown) {
        setArrowDown(true);
        moveDown();
      } else if (
        dodgeButton.selected &&
        event.key === "ArrowLeft" &&
        !arrowLeft
      ) {
        setArrowLeft(true);
        try {
          socket.emit("moveEnable", 1);
        } catch (error) {
          console.error("Failed to move the paddle left:", error);
        }
      } else if (
        dodgeButton.selected &&
        event.key === "ArrowRight" &&
        !arrowRight
      ) {
        setArrowRight(true);
        try {
          socket.emit("moveEnable", 2);
        } catch (error) {
          console.error("Failed to move the paddle right:", error);
        }
      } else if (!abilities) return;
      else if (event.key === "s") socket.emit("randomAbility");
      else if (event.key === "a") socket.emit("specialAbility");
      else if (event.key === "c") socket.emit("clearAbility");
    },
    [
      arrowDown,
      arrowUp,
      abilities,
      arrowLeft,
      arrowRight,
      dodgeButton.selected,
      socket,
    ]
  );

  interface rejoinData {
    mode: number;
    hyper: boolean;
    dodge: boolean;
    player: number;
    ability: number;
    player1Character: number;
    player1Size: number;
    player1X: number;
    player1Y: number;
    player1Name: string;
    player2Character: number;
    player2Size: number;
    player2X: number;
    player2Y: number;
    player2Name: string;
    score: { p1: number; p2: number };
    ballSize: number;
    checkGameStarted: boolean;
  }

  useEffect(() => {
    socket.emit("loadWindow");
    socket.emit("checkOngoingGame");
    function handleRejoin(data: rejoinData) {
      setGameSelection(false);
      if (data.player2Name.length === 0) {
        setPlayerWaiting(true);
      } else if (data.checkGameStarted) {
        setGameStarted(true);
      } else {
        setGameInit(true);
      }
      setSelectedGamemode(data.mode);
      dodgeButton.selected = data.dodge;
      hyperButton.selected = data.hyper;
      setPlayer(data.player);
      setPlayer1PositionX(data.player1X);
      setPlayer2PositionX(data.player2X);
      setPlayer1Position(data.player1Y);
      setPlayer2Position(data.player2Y);
      setScore(data.score);
      setPlayer1Name(data.player1Name);
      setPlayer2Name(data.player2Name);
      setBallSize(data.ballSize);
      if (data.mode !== Mode.Regular) {
        setAbilities(true);
        switch (data.ability) {
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
            setPlayerAbility(Images.DeflectAbility);
            break;
          case 6:
            break;
        }
        let playerNum;
        if (player === 1) playerNum = data.player1Character;
        else playerNum = data.player2Character;
        switch (playerNum) {
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
        if (data.dodge) {
          setPlayerUlt(Images.RaivenSpecial);
          setMaxTimerAnim(10);
        } else if (data.hyper) setMaxTimerAnim(10);
        switch (data.player2Character) {
          case Character.Venomtail:
            switch (data.player2Size) {
              case Paddles.Small:
                setPlayer2Character(Images.paddleVentailS);
                setPlayer2Size({ width: 10, height: 50 });
                break;
              case Paddles.AverageJoe:
                setPlayer2Character(Images.paddleVentailM);
                setPlayer2Size({ width: 20, height: 100 });
                break;
              case Paddles.BigPete:
                setPlayer2Character(Images.paddleVentailL);
                setPlayer2Size({ width: 32, height: 160 });
                break;
            }
            break;
          case Character.BelowZero:
            switch (data.player2Size) {
              case Paddles.Small:
                setPlayer2Character(Images.paddleBzS);
                setPlayer2Size({ width: 10, height: 50 });
                break;
              case Paddles.AverageJoe:
                setPlayer2Character(Images.paddleBzM);
                setPlayer2Size({ width: 20, height: 100 });
                break;
              case Paddles.BigPete:
                setPlayer2Character(Images.paddleBzL);
                setPlayer2Size({ width: 32, height: 160 });
                break;
            }
            break;
          case Character.Raiven:
            switch (data.player2Size) {
              case Paddles.Small:
                setPlayer2Character(Images.paddleRaivenS);
                setPlayer2Size({ width: 10, height: 50 });
                break;
              case Paddles.AverageJoe:
                setPlayer2Character(Images.paddleRaivenM);
                setPlayer2Size({ width: 20, height: 100 });
                break;
              case Paddles.BigPete:
                setPlayer2Character(Images.paddleRaivenL);
                setPlayer2Size({ width: 32, height: 160 });
                break;
            }
        }
        switch (data.player1Character) {
          case Character.Venomtail:
            switch (data.player1Size) {
              case Paddles.Small:
                setPlayer1Character(Images.paddleVentailS);
                setPlayer1Size({ width: 10, height: 50 });
                break;
              case Paddles.AverageJoe:
                setPlayer1Character(Images.paddleVentailM);
                setPlayer1Size({ width: 20, height: 100 });
                break;
              case Paddles.BigPete:
                setPlayer1Character(Images.paddleVentailL);
                setPlayer1Size({ width: 32, height: 160 });
                break;
            }
            break;
          case Character.BelowZero:
            switch (data.player1Size) {
              case Paddles.Small:
                setPlayer1Character(Images.paddleBzS);
                setPlayer1Size({ width: 10, height: 50 });
                break;
              case Paddles.AverageJoe:
                setPlayer1Character(Images.paddleBzM);
                setPlayer1Size({ width: 20, height: 100 });
                break;
              case Paddles.BigPete:
                setPlayer1Character(Images.paddleBzL);
                setPlayer1Size({ width: 32, height: 160 });
                break;
            }
            break;
          case Character.Raiven:
            switch (data.player1Size) {
              case Paddles.Small:
                setPlayer1Character(Images.paddleRaivenS);
                setPlayer1Size({ width: 10, height: 50 });
                break;
              case Paddles.AverageJoe:
                setPlayer1Character(Images.paddleRaivenM);
                setPlayer1Size({ width: 20, height: 100 });
                break;
              case Paddles.BigPete:
                setPlayer1Character(Images.paddleRaivenL);
                setPlayer1Size({ width: 32, height: 160 });
                break;
            }
        }
      }
    }

    socket.on("Game Info", handleRejoin);
    return () => {
      socket.off("Game Info");
    };
  }, [
    Images.BelowZeroSpecial,
    Images.BiggerBallAbility,
    Images.DeflectAbility,
    Images.FreezeAbility,
    Images.MirageAbility,
    Images.RaivenSpecial,
    Images.SmallerBallAbility,
    Images.SoundGrenadeAbility,
    Images.VenomtailSpecial,
    Images.paddleBzL,
    Images.paddleBzM,
    Images.paddleBzS,
    Images.paddleRaivenL,
    Images.paddleRaivenM,
    Images.paddleRaivenS,
    Images.paddleVentailL,
    Images.paddleVentailM,
    Images.paddleVentailS,
    dodgeButton,
    hyperButton,
    player,
    socket,
    ballSize,
  ]);

  useEffect(() => {
    if (socket) {
      socket.on("gameInit", (event: any) => {
        const { player, ability } = event;
        setPlayer(player);
        switch (ability) {
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
            setPlayerAbility(Images.DeflectAbility);
            break;
          case 6:
            break;
        }
      });
      socket.on("scoreUpdate", (event: any) => {
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
        setPlayer1Mirage(false);
        setPlayer2Mirage(false);
        setPlayer1Frozen(false);
        setPlayer2Frozen(false);
        setRaivenSpecial(false);
        setVenomtailSpecial(false);
        BelowZeroSpecialSound.muted = true;
        VenomtailSpecialSound.muted = true;
        raivenSpecialSound.muted = true;
      });
      socket.on("positionsUpdate", (event: any) => {
        const { player1, player2, ball } = event;
        setPlayer1Position(player1);
        setPlayer2Position(player2);
        setBallPosition(ball);
      });
      socket.on("positionXUpdate", (event: any) => {
        const { player1X, player2X } = event;
        setPlayer1PositionX(player1X);
        setPlayer2PositionX(player2X);
      });
      socket.on("winnerUpdate", (event: any) => {
        const { winner, result } = event;
        setWinner(winner);
        setAbilityCooldown(false);
        setUltimateCooldown(false);
        if (winner === 1) setWinnerName(player1Name);
        else if (winner === 2) setWinnerName(player2Name);
        if (result) setResult(result);
        setScore({ p1: 0, p2: 0 });
        // if (abilTimer) {
        //   clearInterval(abilTimer);
        // }
        // if (ultTimer) {
        //   clearInterval(ultTimer);
        // }
      });
      socket.on("gameStatus", (event: any) => {
        const { gameStatus } = event;
        setGameStarted(gameStatus);
      });
      socket.on("loadWindow", (event: any) => {
        const { load } = event;
        setRender(load);
      });
      socket.on("playerUsernames", (event: any) => {
        const { player1Username, player2Username } = event;
        setPlayer1Name(player1Username);
        setPlayer2Name(player2Username);
      });
      socket.on("gameOptions", (event: any) => {
        const {
          mode,
          hyper,
          dodge,
          player1Character,
          player1Size,
          player1X,
          player1Y,
          player2Character,
          player2Size,
          player2X,
          player2Y,
          BallSize,
        } = event;
        setSelectedGamemode(mode);
        setBallSize(BallSize);
        dodgeButton.selected = dodge;
        hyperButton.selected = hyper;
        if (mode !== Mode.Regular) {
          setAbilities(true);
          let playerNum;
          if (player === 1) playerNum = player1Character;
          else playerNum = player2Character;
          switch (playerNum) {
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
          } else if (hyperButton.selected) setMaxTimerAnim(10);
        }
        if (mode === Mode.MasterOfPong || mode === Mode.Singleplayer) {
          setPlayer1PositionX(player1X);
          setPlayer2PositionX(player2X);
          setPlayer1Position(player1Y);
          setPlayer2Position(player2Y);
          switch (player2Character) {
            case Character.Venomtail:
              switch (player2Size) {
                case Paddles.Small:
                  setPlayer2Character(Images.paddleVentailS);
                  setPlayer2Size({ width: 10, height: 50 });
                  break;
                case Paddles.AverageJoe:
                  setPlayer2Character(Images.paddleVentailM);
                  setPlayer2Size({ width: 20, height: 100 });
                  break;
                case Paddles.BigPete:
                  setPlayer2Character(Images.paddleVentailL);
                  setPlayer2Size({ width: 32, height: 160 });
                  break;
              }
              break;
            case Character.BelowZero:
              switch (player2Size) {
                case Paddles.Small:
                  setPlayer2Character(Images.paddleBzS);
                  setPlayer2Size({ width: 10, height: 50 });
                  break;
                case Paddles.AverageJoe:
                  setPlayer2Character(Images.paddleBzM);
                  setPlayer2Size({ width: 20, height: 100 });
                  break;
                case Paddles.BigPete:
                  setPlayer2Character(Images.paddleBzL);
                  setPlayer2Size({ width: 32, height: 160 });
                  break;
              }
              break;
            case Character.Raiven:
              switch (player2Size) {
                case Paddles.Small:
                  setPlayer2Character(Images.paddleRaivenS);
                  setPlayer2Size({ width: 10, height: 50 });
                  break;
                case Paddles.AverageJoe:
                  setPlayer2Character(Images.paddleRaivenM);
                  setPlayer2Size({ width: 20, height: 100 });
                  break;
                case Paddles.BigPete:
                  setPlayer2Character(Images.paddleRaivenL);
                  setPlayer2Size({ width: 32, height: 160 });
                  break;
              }
          }
          switch (player1Character) {
            case Character.Venomtail:
              switch (player1Size) {
                case Paddles.Small:
                  setPlayer1Character(Images.paddleVentailS);
                  setPlayer1Size({ width: 10, height: 50 });
                  break;
                case Paddles.AverageJoe:
                  setPlayer1Character(Images.paddleVentailM);
                  setPlayer1Size({ width: 20, height: 100 });
                  break;
                case Paddles.BigPete:
                  setPlayer1Character(Images.paddleVentailL);
                  setPlayer1Size({ width: 32, height: 160 });
                  break;
              }
              break;
            case Character.BelowZero:
              switch (player1Size) {
                case Paddles.Small:
                  setPlayer1Character(Images.paddleBzS);
                  setPlayer1Size({ width: 10, height: 50 });
                  break;
                case Paddles.AverageJoe:
                  setPlayer1Character(Images.paddleBzM);
                  setPlayer1Size({ width: 20, height: 100 });
                  break;
                case Paddles.BigPete:
                  setPlayer1Character(Images.paddleBzL);
                  setPlayer1Size({ width: 32, height: 160 });
                  break;
              }
              break;
            case Character.Raiven:
              switch (player1Size) {
                case Paddles.Small:
                  setPlayer1Character(Images.paddleRaivenS);
                  setPlayer1Size({ width: 10, height: 50 });
                  break;
                case Paddles.AverageJoe:
                  setPlayer1Character(Images.paddleRaivenM);
                  setPlayer1Size({ width: 20, height: 100 });
                  break;
                case Paddles.BigPete:
                  setPlayer1Character(Images.paddleRaivenL);
                  setPlayer1Size({ width: 32, height: 160 });
                  break;
              }
          }
        }
        setGameInit(true);
        setGameSelection(false);
        setPlayerWaiting(false);
      });
      if (abilities) {
        // Ability timers
        socket.on("secondsLeft", (event: any) => {
          const { secondsLeft } = event;
          setSecondsLeft(secondsLeft);
          if (secondsLeft === 0) setHasAbility(true);
          if (hasAbility && secondsLeft > 0) {
            setHasAbility(false);
            setAbilityCooldownImage(Images.Cooldown[0]);
            setAbilityCooldown(true);
          }
        });
        socket.on("secondsLeftUlt", (event: any) => {
          const { secondsLeftUlt } = event;
          setSecondsLeftUlt(secondsLeftUlt);
          if (secondsLeftUlt === 0) setHasUlt(true);
          else if (hasUlt && secondsLeftUlt > 0) {
            setHasUlt(false);
            setUltimateCooldownImage(Images.Cooldown[0]);
            setUltimateCooldown(true);
          }
        });
        // Character special abilities
        socket.on("VenomtailSpecial", (event: any) => {
          const { VenomtailSpecial, target } = event;
          setVenomtailSpecial(VenomtailSpecial);
          setVenomtailTarget(target);
          VenomtailSpecialSound.muted = false;
          VenomtailSpecialSound.play();
        });
        socket.on("BelowZeroSpecial", (event: any) => {
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
        socket.on("RaivenSpecial", (event: any) => {
          const { RaivenSpecial } = event;
          setRaivenSpecial(RaivenSpecial);
          if (RaivenSpecial) {
            raivenSpecialSound.muted = false;
            raivenSpecialSound.play();
          }
        });

        // random abilities / powerups
        socket.on("AbilityMirage", (event: any) => {
          const { AbilityMirage, target } = event;
          setAbilityMirage(AbilityMirage);
          if (target === 1) {
            setPlayer1Mirage(AbilityMirage);
            setPlayer2Mirage(!AbilityMirage);
          } else {
            setPlayer2Mirage(AbilityMirage);
            setPlayer1Mirage(!AbilityMirage);
          }
        });
        socket.on("SoundGrenade", (event: any) => {
          soundGrenadeSound.play();
        });
        socket.on("BallSize", (event: any) => {
          const { ballSize } = event;
          setBallSize(ballSize);
        });
        socket.on("mirageUpdate", (event: any) => {
          const { mirageUpdate } = event;
          setMiragePos(mirageUpdate);
        });
        socket.on("AbilityFreeze", (event: any) => {
          const { AbilityFreeze } = event;
          setAbilityFreeze(AbilityFreeze);
        });

        socket.on("hasAbility", (event: any) => {
          const { hasAbility, ability } = event;
          setHasAbility(hasAbility);
          if (!hasAbility) {
            setAbilityCooldownImage(Images.Cooldown[0]);
            setAbilityCooldown(true);
          }
          switch (ability) {
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
              if (dodgeButton.selected) setPlayerAbility(Images.HomingAbility);
              else setPlayerAbility(Images.DeflectAbility);
              break;
          }
        });
        socket.on("hasUlt", (event: any) => {
          const { hasUlt } = event;
          setHasUlt(hasUlt);
          if (!hasUlt) {
            setUltimateCooldownImage(Images.Cooldown[0]);
            setUltimateCooldown(true);
          }
        });
        return () => {
          socket?.off("hasUlt");
          socket?.off("hasAbility");
          socket?.off("secondsLeft");
          socket?.off("secondsLeftUlt");
          socket?.off("gameStatus");
          socket?.off("winnerUpdate");
          socket?.off("scoreUpdate");
          socket?.off("gameInit");
          socket?.off("mirageUpdate");
          socket?.off("AbilityMirage");
          socket?.off("SoundGrenade");
          socket?.off("BallSize");
          socket?.off("VenomtailSpecial");
          socket?.off("BelowZeroSpecial");
          socket?.off("RaivenSpecial");
          socket?.off("playerUsernames");
        };
      }
      return () => {
        socket?.off("playerCharacter");
        socket?.off("playerUsernames");
        socket?.off("gameStatus");
        socket?.off("winnerUpdate");
        socket?.off("scoreUpdate");
        socket?.off("gameInit");
      };
    }
  }, [
    abilities,
    hasAbility,
    Images.BiggerBallAbility,
    Images.MirageAbility,
    Images.SmallerBallAbility,
    Images.FreezeAbility,
    Images.SoundGrenadeAbility,
    player,
    VenomtailSpecialSound,
    soundGrenadeSound,
    Images.paddleBzL,
    Images.paddleBzM,
    Images.paddleBzS,
    Images.paddleVentailL,
    Images.paddleVentailM,
    Images.paddleVentailS,
    Images.paddleRaivenL,
    Images.paddleRaivenM,
    Images.paddleRaivenS,
    Images.Cooldown,
    secondsLeft,
    Images.HomingAbility,
    dodgeButton,
    BelowZeroSpecialSound,
    raivenSpecialSound,
    maxTimerAnim,
    score.p1,
    Images.DeflectAbility,
    player1Name,
    player2Name,
    socket,
    hyperButton,
    Images.BelowZeroSpecial,
    Images.RaivenSpecial,
    Images.VenomtailSpecial,
    selectedGamemode,
    hasUlt,
  ]);

  useEffect(() => {
    if (!abilityCooldown) return;
    var animFrame = 1;
    const abilTimer = setInterval(() => {
      setAbilityCooldownImage(
        Images.Cooldown[animFrame % Images.Cooldown.length]
      );
      animFrame++;
      if (animFrame >= maxTimerAnim) {
        clearInterval(abilTimer);
        setAbilityCooldown(false);
      }
    }, 500);
    return () => {
      clearInterval(abilTimer);
    };
  }, [Images.Cooldown, abilityCooldown, maxTimerAnim]);

  useEffect(() => {
    if (!ultimateCooldown) return;
    var animFrame = 1;
    const ultTimer = setInterval(() => {
      setUltimateCooldownImage(
        Images.Cooldown[animFrame % Images.Cooldown.length]
      );
      animFrame++;
      if (animFrame >= maxTimerAnim) {
        clearInterval(ultTimer);
        setUltimateCooldown(false);
      }
    }, 500);
    return () => {
      clearInterval(ultTimer);
    };
  }, [Images.Cooldown, maxTimerAnim, ultimateCooldown]);

  useEffect(() => {
    let cnv = canvas.current;
    async function emitActivityStatus() {
      const token = getToken(process.env.REACT_APP_JWT_NAME as string);
      if (token) {
        const userID = await getUserID(token);
        setUserID(userID);
        socket?.emit("activityStatus", {
          userID: userID,
          status: "online",
        });
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    if (isGameSelection && cnv) {
      emitActivityStatus();
      cnv.addEventListener("click", handleMouseClick);
      cnv.addEventListener("mousemove", handleMouseMove);
    }
    return () => {
      if (isGameSelection && cnv) {
        cnv.removeEventListener("click", handleMouseClick);
        cnv.removeEventListener("mousemove", handleMouseMove);
      }
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    canvas,
    handleMouseClick,
    handleMouseMove,
    handleKeyUp,
    handleKeyDown,
    isGameSelection,
    socket,
  ]);

  useEffect(() => {
    if (canvas.current) {
      if (ctx) {
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        if (isGameStarted) {
          ctx.fillStyle = backgroundColor;
          if (raivenSpecial) {
            ctx.fillRect(10, player1Position - 10, 20, 120);
            ctx.globalAlpha = 0.1;
          }
          ctx.fillRect(0, 0, 1200, 800);
          ctx.fillStyle = "white";
          ctx.globalAlpha = 1;
          if (playerScored > 0) {
            ctx.fillStyle = "red";
            if (playerScored === 2) {
              ctx.fillRect(0, 0, 7, 800);
            } else {
              ctx.fillRect(1193, 0, 7, 800);
            }
          }
          if (selectedGamemode !== Mode.Regular) {
            ctx.drawImage(player1Character, player1PositionX, player1Position);
            ctx.drawImage(player2Character, player2PositionX, player2Position);
            if (player === 1) {
              ctx.font = "27px Arial";
              ctx.fillStyle = "black";
              if (hasUlt) ctx.drawImage(playerUlt, 80, 700, 60, 60);
              else {
                ctx.drawImage(ultimateCooldownImage, 80, 700, 60, 60);
                if (secondsLeftUlt < 10)
                  ctx.fillText(`${secondsLeftUlt}`, 110, 732);
                else ctx.fillText(`${secondsLeftUlt}`, 108, 732);
              }
              if (hasAbility) ctx.drawImage(playerAbility, 150, 700, 60, 60);
              else {
                ctx.drawImage(abilityCooldownImage, 150, 700, 60, 60);
                if (secondsLeft < 10) ctx.fillText(`${secondsLeft}`, 180, 732);
                else ctx.fillText(`${secondsLeft}`, 178, 732);
              }
            } else if (player === 2) {
              ctx.font = "27px Arial";
              ctx.fillStyle = "black";
              if (hasAbility) ctx.drawImage(playerAbility, 1060, 700, 60, 60);
              else {
                ctx.drawImage(abilityCooldownImage, 1060, 700, 60, 60);
                if (secondsLeft < 10) ctx.fillText(`${secondsLeft}`, 1090, 732);
                else ctx.fillText(`${secondsLeft}`, 1088, 732);
              }
              if (hasUlt) ctx.drawImage(playerUlt, 990, 700, 60, 60);
              else {
                ctx.drawImage(ultimateCooldownImage, 990, 700, 60, 60);
                if (secondsLeftUlt < 10)
                  ctx.fillText(`${secondsLeftUlt}`, 1020, 732);
                else ctx.fillText(`${secondsLeftUlt}`, 1018, 732);
              }
            }
          } else {
            ctx.fillStyle = "white";
            ctx.fillRect(player1PositionX, player1Position, 20, 100);
            ctx.fillRect(player2PositionX, player2Position, 20, 100);

            ctx.strokeStyle = "black";
            ctx.lineWidth = 2;
            ctx.strokeRect(player1PositionX, player1Position, 20, 100);
            ctx.strokeRect(player2PositionX, player2Position, 20, 100);
          }
          if (player1Frozen) {
            ctx.globalAlpha = 0.5;
            ctx.drawImage(
              Images.iceBlock,
              player1PositionX - 5,
              player1Position - 10,
              player1Size.width + 10,
              player1Size.height + 20
            );
            ctx.globalAlpha = 1;
          }
          if (player2Frozen) {
            ctx.globalAlpha = 0.5;
            ctx.drawImage(
              Images.iceBlock,
              player2PositionX - 5,
              player2Position - 10,
              player2Size.width + 10,
              player2Size.height + 20
            );
            ctx.globalAlpha = 1;
          }
          if (abilities) {
            // p1 health border
            ctx.drawImage(Images.healthText, 185, 60, 140, 25);
            ctx.font = "20px Arial";
            ctx.fillStyle = "black";
            ctx.fillText(player1Name, 255, 75);
            ctx.drawImage(Images.left_bar, 150, 25, 25, 40);
            ctx.drawImage(Images.mid_bar, 175, 25, 25, 40);
            ctx.drawImage(Images.mid_bar, 200, 25, 25, 40);
            ctx.drawImage(Images.mid_bar, 225, 25, 26, 40);
            ctx.drawImage(Images.mid_bar, 251, 25, 26, 40);
            ctx.drawImage(Images.mid_bar, 277, 25, 26, 40);
            ctx.drawImage(Images.right_bar, 303, 25, 25, 40);
            ctx.drawImage(Images.iconBackground, 120, 25, 45, 45);
            ctx.drawImage(Images.icon, 131, 38, 23, 20);
            ctx.font = "15px Arial";
            ctx.fillText(`${11 - score.p2}`, 142, 50);
            // p2 health border
            ctx.drawImage(Images.healthText, 875, 60, 140, 25);
            ctx.font = "20px Arial";
            ctx.fillText(player2Name, 945, 75);
            ctx.drawImage(Images.left_bar, 872, 25, 25, 40);
            ctx.drawImage(Images.mid_bar, 897, 25, 26, 40);
            ctx.drawImage(Images.mid_bar, 923, 25, 26, 40);
            ctx.drawImage(Images.mid_bar, 949, 25, 26, 40);
            ctx.drawImage(Images.mid_bar, 975, 25, 25, 40);
            ctx.drawImage(Images.mid_bar, 1000, 25, 25, 40);
            ctx.drawImage(Images.right_bar, 1025, 25, 25, 40);
            ctx.drawImage(Images.iconBackground, 1035, 25, 45, 45);
            ctx.drawImage(Images.icon, 1046, 38, 23, 20);
            ctx.font = "15px Arial";
            ctx.fillText(`${11 - score.p1}`, 1057, 50);
            var x = 0;
            // draw p1 health bars
            while (x < 11 - score.p2) {
              if (x === 0) ctx.drawImage(Images.left_health, 151, 25, 25, 40);
              else if (x === 10)
                ctx.drawImage(Images.right_health, 303, 25, 25, 40);
              else ctx.drawImage(Images.mid_health, 163 + 14 * x, 25, 13, 40);
              x++;
            }
            x = 0;
            // draw p2 health bars
            while (x < 11 - score.p1) {
              if (x === 0) ctx.drawImage(Images.right_health, 1024, 25, 25, 40);
              else if (x === 10)
                ctx.drawImage(Images.left_health, 872, 25, 25, 40);
              else ctx.drawImage(Images.mid_health, 1024 - 14 * x, 25, 13, 40);
              x++;
            }

            // Draw the ball
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(ballPosition.x, ballPosition.y, ballSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "black";
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.arc(ballPosition.x, ballPosition.y, ballSize, -2, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = "white";

            if (raivenSpecial) {
              ctx.globalAlpha = 0.7;
              ctx.fillStyle = "rgb(255, 188, 0)";
              ctx.strokeStyle = "rgb(255, 188, 0)";
              ctx.beginPath();
              ctx.arc(ballPosition.x, ballPosition.y, ballSize, 0, Math.PI * 2);
              ctx.fill();
              ctx.beginPath();
              ctx.arc(
                ballPosition.x,
                ballPosition.y,
                ballSize + 12,
                0,
                Math.PI * 2
              );
              ctx.stroke();
            }
            if (abilityFreeze) {
              ctx.globalAlpha = 0.5;
              ctx.drawImage(
                Images.iceBlock,
                ballPosition.x - ballSize - 10,
                ballPosition.y - ballSize - 10,
                ballSize * 2 + 20,
                ballSize * 2 + 20
              );
              ctx.globalAlpha = 1;
            }

            // Draw the line to the ball, when Venomtail ability is used
            if (VenomtailSpecial) {
              ctx.beginPath();
              if (VenomtailTarget === 1)
                ctx.moveTo(
                  player1Size.width + 10,
                  player1Position + player1Size.height / 2
                );
              else if (VenomtailTarget === 2)
                ctx.moveTo(1170, player2Position + player2Size.height / 2);
              ctx.lineTo(ballPosition.x, ballPosition.y);
              ctx.strokeStyle = "white";
              ctx.lineWidth = 3;
              ctx.stroke();
              ctx.closePath();
              ctx.strokeStyle = "black";
              ctx.lineWidth = 1;
            }

            if (abilityMirage) {
              if (
                (player1Mirage && player === 1) ||
                (player2Mirage && player === 2)
              )
                ctx.globalAlpha = 0.8;
              else ctx.globalAlpha = 0.3;
              for (var i in miragePos) {
                ctx.beginPath();
                ctx.arc(
                  miragePos[i][0],
                  miragePos[i][1],
                  ballSize,
                  0,
                  Math.PI * 2
                );
                ctx.fill();
                ctx.closePath();
                ctx.strokeStyle = "black";
                ctx.beginPath();
                ctx.lineWidth = 2;
                ctx.arc(
                  miragePos[i][0],
                  miragePos[i][1],
                  ballSize,
                  -2,
                  Math.PI * 2
                );
                ctx.stroke();
              }
              ctx.globalAlpha = 1;
            }
          } else {
            ctx.font = "30px Arial";
            ctx.fillStyle = "black";
            ctx.fillText(player1Name, 400, 30);
            ctx.fillText(player2Name, 800, 30);
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(`${score.p1} - ${score.p2}`, 600, 30);

            // Draw the ball
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(ballPosition.x, ballPosition.y, ballSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "black";
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.arc(ballPosition.x, ballPosition.y, ballSize, -2, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = "white";
          }
        } else if (isGameSelection) {
          ctx.globalAlpha = 1;
          ctx.clearRect(0, 0, 1200, 800);
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, 1200, 800);
          ctx.font = "40px Arial"; //ITC Zapf Chancery
          ctx.fillStyle = "white";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          ctx.drawImage(Images.headGamemode, 450, 20, 300, 75);
          ctx.drawImage(Images.headPaddle, 450, 190, 300, 75);
          ctx.drawImage(Images.headCharacter, 450, 420, 300, 75);

          drawButton(ctx, startButton, Mode.Start);
          for (var index in gamemodeButtons) {
            drawButton(ctx, gamemodeButtons[index], selectedGamemode);
          }
          for (index in paddleButtons) {
            drawButton(ctx, paddleButtons[index], selectedPaddle);
          }
          for (index in characterButtons) {
            drawButton(ctx, characterButtons[index], selectedCharacter);
          }
          drawButton(ctx, hyperButton, Mode.Hyper, 5);
          drawButton(ctx, dodgeButton, Mode.Dodge, 5);
        } else if (playerChose) {
          // VenomtailSpecial,
          // isGameStarted,
          // abilityMirage,
          // selectedGamemode,
          // selectedPaddle,
          // abilityFreeze,
          // selectedCharacter,
          // raivenSpecial,
          // player1Character,
          // player2Character,
          // player1Size,
          // player2Size.height,
          // player2Size.width,
          // VenomtailTarget,
          // isPlayerWaiting,
          // isGameSelection,
          // isGameInit,
          // player1Frozen,
          // player2Frozen,
          // player,
          // playerChose,
          // playerScored,
          // player1Name,
          // player2Name,
          const cnv = canvas.current;
          cnv.addEventListener("mousemove", handleFinishMove);
          cnv.addEventListener("mousedown", handleLeaveClick);
          var startIndex = Images.YinYangEnd.length - 1;
          const animInterval = setInterval(() => {
            if (canvas.current) {
              ctx.drawImage(Images.YinYangEnd[startIndex], 0, 0, 1200, 800);
              drawButton(ctx, resetButton, Mode.Reset);
            }
            startIndex--;
            if (startIndex < 0) {
              clearInterval(animInterval);
              setPlayerChose(false);
              handleStartGame();
              setPlayerWaiting(true);
              cnv.removeEventListener("mousemove", handleFinishMove);
              cnv.removeEventListener("mousedown", handleLeaveClick);
              return;
            }
          }, 15);
          return () => {
            clearInterval(animInterval);
            cnv.removeEventListener("mousemove", handleFinishMove);
            cnv.removeEventListener("mousedown", handleLeaveClick);
          };
        } else if (
          isPlayerWaiting ||
          (isGameInit && (player1Name.length === 0 || player2Name.length === 0))
        ) {
          const cnv = canvas.current;
          if (isPlayerWaiting) {
            cnv.addEventListener("mousemove", handleFinishMove);
            cnv.addEventListener("mousedown", handleLeaveClick);
          }
          var rotIndex = 0;
          const animInterval = setInterval(() => {
            if (canvas.current) {
              ctx.drawImage(Images.YinYangRotate[rotIndex], 0, 0, 1200, 800);
              drawButton(ctx, resetButton, Mode.Reset);
            }
            rotIndex++;
            if (rotIndex === Images.YinYangRotate.length) {
              rotIndex = 0;
            }
          }, 33);
          return () => {
            clearInterval(animInterval);
            if (isPlayerWaiting) {
              cnv.removeEventListener("mousemove", handleFinishMove);
              cnv.removeEventListener("mousedown", handleLeaveClick);
            }
          };
        } else if (isGameInit) {
          var rotaIndex = 0;
          var endIndex = 0;
          if (result) setGameInit(false);
          const animInterval = setInterval(() => {
            if (rotaIndex === Images.YinYangRotate.length && canvas.current) {
              ctx.fillStyle = backgroundColor;
              ctx.fillRect(0, 0, 1200, 800);
              ctx.fillStyle = "white";
              ctx.globalAlpha = 1;
              if (selectedGamemode !== Mode.Regular) {
                ctx.drawImage(
                  player1Character,
                  player1PositionX,
                  player1Position
                );
                ctx.drawImage(
                  player2Character,
                  player2PositionX,
                  player2Position
                );
                if (player === 1) {
                  ctx.drawImage(playerUlt, 80, 700, 60, 60);
                  ctx.drawImage(playerAbility, 150, 700, 60, 60);
                } else if (player === 2) {
                  ctx.drawImage(playerAbility, 1060, 700, 60, 60);
                  ctx.drawImage(playerUlt, 990, 700, 60, 60);
                }
              } else {
                ctx.fillStyle = "white";
                ctx.fillRect(player1PositionX, player1Position, 20, 100);
                ctx.fillRect(player2PositionX, player2Position, 20, 100);

                ctx.strokeStyle = "black";
                ctx.lineWidth = 2;
                ctx.strokeRect(player1PositionX, player1Position, 20, 100);
                ctx.strokeRect(player2PositionX, player2Position, 20, 100);
              }
              if (abilities) {
                // p1 health border
                ctx.drawImage(Images.healthText, 185, 60, 140, 25);
                ctx.font = "20px Arial";
                ctx.fillStyle = "black";
                ctx.fillText(player1Name, 255, 75);
                ctx.drawImage(Images.left_bar, 150, 25, 25, 40);
                ctx.drawImage(Images.mid_bar, 175, 25, 25, 40);
                ctx.drawImage(Images.mid_bar, 200, 25, 25, 40);
                ctx.drawImage(Images.mid_bar, 225, 25, 26, 40);
                ctx.drawImage(Images.mid_bar, 251, 25, 26, 40);
                ctx.drawImage(Images.mid_bar, 277, 25, 26, 40);
                ctx.drawImage(Images.right_bar, 303, 25, 25, 40);
                ctx.drawImage(Images.iconBackground, 120, 25, 45, 45);
                ctx.drawImage(Images.icon, 131, 38, 23, 20);
                ctx.font = "15px Arial";
                ctx.fillText(`${11 - score.p2}`, 142, 50);
                // p2 health border
                ctx.drawImage(Images.healthText, 875, 60, 140, 25);
                ctx.font = "20px Arial";
                ctx.fillText(player2Name, 945, 75);
                ctx.drawImage(Images.left_bar, 872, 25, 25, 40);
                ctx.drawImage(Images.mid_bar, 897, 25, 26, 40);
                ctx.drawImage(Images.mid_bar, 923, 25, 26, 40);
                ctx.drawImage(Images.mid_bar, 949, 25, 26, 40);
                ctx.drawImage(Images.mid_bar, 975, 25, 25, 40);
                ctx.drawImage(Images.mid_bar, 1000, 25, 25, 40);
                ctx.drawImage(Images.right_bar, 1025, 25, 25, 40);
                ctx.drawImage(Images.iconBackground, 1035, 25, 45, 45);
                ctx.drawImage(Images.icon, 1046, 38, 23, 20);
                ctx.font = "15px Arial";
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
                ctx.fillStyle = "white";
                ctx.beginPath();
                ctx.arc(
                  ballPosition.x,
                  ballPosition.y,
                  ballSize,
                  0,
                  Math.PI * 2
                );
                ctx.fill();
                ctx.strokeStyle = "black";
                ctx.beginPath();
                ctx.lineWidth = 2;
                ctx.arc(
                  ballPosition.x,
                  ballPosition.y,
                  ballSize,
                  -2,
                  Math.PI * 2
                );
                ctx.stroke();
                ctx.fillStyle = "white";
              } else {
                ctx.font = "30px Arial";
                ctx.fillStyle = "white";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(`${score.p1} - ${score.p2}`, 600, 30);
              }
              ctx.fillStyle = "black";
              ctx.font = "35px Arial";
              ctx.fillText(player1Name, 400, 150);
              ctx.fillText(player2Name, 800, 150);
              ctx.font = "40px Arial";
              ctx.fillText("VS", 600, 150);
              ctx.drawImage(Images.YinYangEnd[endIndex], 0, 0, 1200, 800);
              endIndex++;
              if (endIndex === Images.YinYangEnd.length) {
                clearInterval(animInterval);
                setGameInit(false);
                setGameStarted(true);
                socket?.emit("readyToPlay");
                return;
              }
            } else {
              // if (rotaIndex === Images.YinYangRotate.length) rotaIndex = 0;
              if (rotaIndex !== Images.YinYangRotate.length && canvas.current) {
                ctx.drawImage(Images.YinYangRotate[rotaIndex], 0, 0, 1200, 800);
                rotaIndex++;
              }
            }
          }, 33);
          return () => clearInterval(animInterval);
        }
      }
    }
  }, [
    result,
    player1Position,
    player2Position,
    ballPosition,
    VenomtailSpecial,
    score,
    winner,
    ballSize,
    drawButton,
    isGameStarted,
    gamemodeButtons,
    canvas,
    ctx,
    handleMouseMove,
    Images.iceBlock,
    abilityMirage,
    miragePos,
    paddleButtons,
    selectedGamemode,
    selectedPaddle,
    abilityFreeze,
    characterButtons,
    selectedCharacter,
    raivenSpecial,
    abilities,
    hasAbility,
    Images.healthText,
    Images.icon,
    Images.iconBackground,
    Images.left_bar,
    Images.left_health,
    Images.mid_bar,
    Images.mid_health,
    Images.right_bar,
    Images.right_health,
    player1Character,
    player2Character,
    secondsLeft,
    hasUlt,
    player1Size,
    playerAbility,
    playerUlt,
    secondsLeftUlt,
    player2Size.height,
    player2Size.width,
    VenomtailTarget,
    Images.headGamemode,
    startButton,
    Images,
    isPlayerWaiting,
    isGameSelection,
    isGameInit,
    player1Frozen,
    player2Frozen,
    player,
    abilityCooldownImage,
    ultimateCooldownImage,
    resetButton,
    handleFinishClick,
    handleFinishMove,
    hyperButton,
    dodgeButton,
    playerChose,
    handleStartGame,
    player1PositionX,
    player2PositionX,
    playerScored,
    endScreen,
    player1Name,
    player2Name,
    socket,
    handleLeaveClick,
    player1Mirage,
    player2Mirage,
  ]);

  useEffect(() => {
    let cnv = canvas.current;
    if (cnv && ctx && (winner === 1 || winner === 2)) {
      cnv.addEventListener("click", handleFinishClick);
      cnv.addEventListener("mousemove", handleFinishMove);
      const grd = ctx.createLinearGradient(0, 900, 0, 0);

      if (winner === player) {
        grd.addColorStop(0, "maroon");
        grd.addColorStop(0.5, "red");
        grd.addColorStop(1, "orange");
      } else {
        grd.addColorStop(0, "rgb(10, 20, 120)");
        grd.addColorStop(0.5, "rgb(70, 70, 100)");
        grd.addColorStop(1, "rgb(60, 60, 60)");
      }
      ctx.font = "bold 40px Arial";
      let timer: NodeJS.Timeout;
      if (winner === player) {
        ctx.fillStyle = "white";
        if (result) ctx.fillText("Opponent disconnected", 600, 150);
        ctx.fillText("You have reached transcendence", 600, 200);
        ctx.drawImage(endScreen.Mountains, 100, 300);
        ctx.drawImage(endScreen.Cloud1, endScreen.c1x, 430);
        ctx.drawImage(endScreen.Cloud2, endScreen.c2x, 535);
        ctx.drawImage(endScreen.Cloud3, endScreen.c3x, 370);
        timer = setInterval(() => {
          ctx.fillStyle = grd;
          if (cnv) ctx.fillRect(0, 0, cnv.width, cnv.height);
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
          ctx.fillStyle = "white";
          if (result) ctx.fillText("Opponent disconnected", 600, 150);
          ctx.fillText("You have reached transcendence", 600, 200);
          drawButton(ctx, resetButton, Mode.Reset);
          if (
            endScreen.c1x === endScreen.c1max ||
            endScreen.c1x === endScreen.c1min
          )
            endScreen.c1behind = !endScreen.c1behind;
          if (
            endScreen.c2x === endScreen.c2max ||
            endScreen.c2x === endScreen.c2min
          )
            endScreen.c2behind = !endScreen.c2behind;
          if (
            endScreen.c3x === endScreen.c3max ||
            endScreen.c3x === endScreen.c3min
          )
            endScreen.c3behind = !endScreen.c3behind;
        }, 100);
        drawButton(ctx, resetButton, Mode.Reset);
      } else {
        ctx.fillStyle = "black";
        ctx.fillText(
          winnerName + " reaches transcendence, leaving you in the dust.",
          600,
          200
        );
        ctx.drawImage(endScreen.Mountains, 100, 300);
        ctx.drawImage(endScreen.Cloud1, endScreen.c1x, 430);
        ctx.drawImage(endScreen.Cloud2, endScreen.c2x, 535);
        ctx.drawImage(endScreen.Cloud3, endScreen.c3x, 370);
        timer = setInterval(() => {
          ctx.fillStyle = grd;
          if (canvas.current) ctx.fillRect(0, 0, 1200, 800);
          if (endScreen.c1behind && endScreen.c1x > endScreen.c1min) {
            endScreen.c1x -= 1;
            if (endScreen.c1LightningActive) {
              ctx.drawImage(
                endScreen.lightningImage,
                endScreen.lightningPosition,
                505,
                60,
                180
              );
            }
            ctx.drawImage(endScreen.Cloud1, endScreen.c1x, 430);
          }
          if (endScreen.c2behind && endScreen.c2x < endScreen.c2max) {
            endScreen.c2x += 1;
            if (endScreen.c2LightningActive) {
              ctx.drawImage(
                endScreen.lightningImage,
                endScreen.lightningPosition,
                574,
                30,
                90
              );
            }
            ctx.drawImage(endScreen.Cloud2, endScreen.c2x, 535);
          }
          if (endScreen.c3behind && endScreen.c3x > endScreen.c3min) {
            endScreen.c3x -= 1;
            if (endScreen.c3LightningActive) {
              ctx.drawImage(
                endScreen.lightningImage,
                endScreen.lightningPosition,
                411,
                30,
                90
              );
            }
            ctx.drawImage(endScreen.Cloud3, endScreen.c3x, 370);
          }
          ctx.drawImage(endScreen.Mountains, 100, 300);
          if (!endScreen.c1behind && endScreen.c1x < endScreen.c1max) {
            endScreen.c1x += 1;
            if (endScreen.c1LightningActive) {
              ctx.drawImage(
                endScreen.lightningImage,
                endScreen.lightningPosition,
                505,
                60,
                180
              );
            }
            ctx.drawImage(endScreen.Cloud1, endScreen.c1x, 430);
          }
          if (!endScreen.c2behind && endScreen.c2x > endScreen.c2min) {
            endScreen.c2x -= 1;
            if (endScreen.c2LightningActive) {
              ctx.drawImage(
                endScreen.lightningImage,
                endScreen.lightningPosition,
                574,
                30,
                90
              );
            }
            ctx.drawImage(endScreen.Cloud2, endScreen.c2x, 535);
          }
          if (!endScreen.c3behind && endScreen.c3x < endScreen.c3max) {
            endScreen.c3x += 1;
            if (endScreen.c3LightningActive) {
              ctx.drawImage(
                endScreen.lightningImage,
                endScreen.lightningPosition,
                411,
                30,
                90
              );
            }
            ctx.drawImage(endScreen.Cloud3, endScreen.c3x, 370);
          }
          ctx.fillStyle = "black";
          ctx.fillText(
            winnerName + " reaches transcendence, leaving you in the dust.",
            600,
            200
          );
          drawButton(ctx, resetButton, Mode.Reset);
          if (
            endScreen.c1x === endScreen.c1max ||
            endScreen.c1x === endScreen.c1min
          )
            endScreen.c1behind = !endScreen.c1behind;
          if (
            endScreen.c2x === endScreen.c2max ||
            endScreen.c2x === endScreen.c2min
          )
            endScreen.c2behind = !endScreen.c2behind;
          if (
            endScreen.c3x === endScreen.c3max ||
            endScreen.c3x === endScreen.c3min
          )
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
                endScreen.lightningPosition =
                  endScreen.c1x + 20 + Math.random() * 200;
                endScreen.c1LightningActive = true;
                break;
              case 1:
                endScreen.lightningPosition =
                  endScreen.c2x + 27 + Math.random() * 80;
                endScreen.c2LightningActive = true;
                break;
              case 2:
                endScreen.lightningPosition =
                  endScreen.c3x + 23 + Math.random() * 42;
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
        if (cnv) {
          cnv.removeEventListener("click", handleFinishClick);
          cnv.removeEventListener("mousemove", handleFinishMove);
        }
      };
    }
  }, [
    canvas,
    ctx,
    drawButton,
    endScreen,
    handleFinishClick,
    handleFinishMove,
    resetButton,
    winnerName,
    winner,
    player,
    socket,
    result,
  ]);

  return (
    <canvas
      ref={canvasRef}
      width={1200}
      height={800}
      style={{ backgroundColor: "black" }}
    ></canvas>
  );
};

export default GameComponent;
