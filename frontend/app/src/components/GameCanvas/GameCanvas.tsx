import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import io, { Socket } from "socket.io-client"
import GetOverHere from '../../sounds/getOverHere.mp3'

axios.defaults.baseURL = 'http://localhost:3333';

type GameComponentProps = {};

const GameComponent: React.FC<GameComponentProps> = () => {
  const [paddlePosition, setPaddlePosition] = useState<number>(250);
  const [botPosition, setBotPosition] = useState<number>(250);
  const [ballPosition, setBallPosition] = useState<{ x: number; y: number }>({ x: 400, y: 300 });
  const [ultimate, setUlitimate] = useState<boolean>(false);
  const [score, setScore] = useState<{ p1: number; p2: number }>({ p1: 0, p2: 0 });
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

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const moveUp = async () => {
      try {
        await axios.post('/game/move/up');
        console.log('moveUp');
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
        const sound = new Audio(GetOverHere);
        sound.play();
      } catch (error) {
        console.error('Failed to use scorpion ability:', error);
      }
    };
  
    if (event.key === 'ArrowUp') {
      moveUp();
    } else if (event.key === 'ArrowDown') {
      moveDown();
    } else if (event.key === 'z') {
      ultScorpion();
    }
  }, []);

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
      socket.current.on('gameUpdate', (event: any) => {
        const { paddle, bot, ball, ultimate, score } = event;
        setPaddlePosition(paddle);
        setBallPosition(ball);
        setBotPosition(bot);
        setUlitimate(ultimate);
        setScore(score);
      });
    }
  }, []);  

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw paddles
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.fillRect(10, paddlePosition, 20, 100);
        ctx.fillRect(770, botPosition, 20, 100);

        // Draw the ball
        ctx.beginPath();
        ctx.arc(ballPosition.x, ballPosition.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.closePath();

        // Draw the line to the ball, when scorpion ability is used
        if (ultimate) {
          // Draw a line between two points
          ctx.beginPath();
          ctx.moveTo(30, paddlePosition + 50); // Move to the first point
          ctx.lineTo(ballPosition.x, ballPosition.y); // Draw a line to the second point
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.closePath();
        }

        // Draw score
        ctx.font = '24px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(`${score.p1}`, canvas.width / 2 - 50, 30);
        ctx.fillText(` - `, canvas.width / 2, 30);
        ctx.fillText(`${score.p2}`, canvas.width / 2 + 50, 30);
      }
    }
  }, [paddlePosition, ballPosition, botPosition, ultimate, score]);



  return (
    <div>
      <canvas ref={canvasRef} width={800} height={600} style={{ backgroundColor: 'black' }}></canvas>
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
