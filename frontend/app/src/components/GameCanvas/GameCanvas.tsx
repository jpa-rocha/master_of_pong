import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import io, { Socket } from "socket.io-client"
import GetOverHere from '../../sounds/getOverHere.mp3'
import SoundGrenade from '../../sounds/Sound_Grenade.mp3'

axios.defaults.baseURL = 'http://localhost:3333';

type GameComponentProps = {};

const GameComponent: React.FC<GameComponentProps> = () => {
  const [player1Position, setPlayer1Position] = useState<number>(250);
  const [player2Position, setPlayer2Position] = useState<number>(250);
  const [ballPosition, setBallPosition] = useState<{ x: number; y: number }>({ x: 400, y: 300 });
  const [score, setScore] = useState<{ p1: number; p2: number }>({ p1: 0, p2: 0 });
  const [ultimate, setUlitimate] = useState<boolean>(false);
  const [winner, setWinner] = useState<string>("");
  var arrowdown = 0;
  var arrowup = 0;
  const [ballSize, setBallSize] = useState<number>(10);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const socket = useRef<Socket | null>(null);


  const handleStartGame = async () => {
    try {
      await axios.post('/game/start');
    } catch (error) {
      console.error('Failed to start the game:', error);
    }
  };

  const handleStopGame = async () => {
    try {
      await axios.post('/game/stop');
    } catch (error) {
      console.error('Failed to stop the game:', error);
    }
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
		arrowup = 0;
	}
	if (event.key === 'ArrowDown') {
		stopPressDown();
		arrowdown = 0;
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

    const ultScorpion = async () => {
      try {
        await axios.post('/game/ultScorpion');
        console.log('ultScorpion');
      } catch (error) {
        console.error('Failed to use scorpion ability:', error);
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
  
    if (event.key === 'ArrowUp' && arrowup == 0) {
		arrowup = 1;
    	moveUp();
    } else if (event.key === 'ArrowDown' && arrowdown == 0) {
		arrowdown = 1;
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
    }
  }, []);

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
    }
  }, []);  

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw paddles
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.fillRect(10, player1Position, 20, 100);
        ctx.fillRect(770, player2Position, 20, 100);

        // Draw the ball
        ctx.beginPath();
        ctx.arc(ballPosition.x, ballPosition.y, ballSize, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.closePath();

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

        // Draw score
        ctx.font = '24px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${score.p1} - ${score.p2}`, canvas.width / 2, 30);
        ctx.font = '40px Arial';
        ctx.fillText(`${winner}`, canvas.width / 2, canvas.height - 50);
      }
    }
  }, [player1Position, player2Position, ballPosition, ultimate, score, winner, ballSize]);



  return (
    <div>
      <canvas ref={canvasRef} width={800} height={600} style={{ backgroundColor: 'black' }}></canvas>
      <div>
        <button onClick={handleStartGame}>
          Start Game
        </button>
      </div>
    </div>
  );
};

export default GameComponent;
