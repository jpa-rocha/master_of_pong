import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import io, { Socket } from "socket.io-client"

axios.defaults.baseURL = 'http://localhost:3333';

type GameComponentProps = {};

const GameComponent: React.FC<GameComponentProps> = () => {
  const [paddlePosition, setPaddlePosition] = useState<number>(250);
  const [botPosition, setBotPosition] = useState<number>(250);
  const [ballPosition, setBallPosition] = useState<{ x: number; y: number }>({ x: 400, y: 300 });
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
        console.error('Failed to start the game:', error);
      }
    };
  
    const moveDown = async () => {
      try {
        await axios.post('/game/move/down');
        console.log('moveDown');
      } catch (error) {
        console.error('Failed to start the game:', error);
      }
    };
  
    if (event.key === 'ArrowUp') {
      moveUp();
    } else if (event.key === 'ArrowDown') {
      moveDown();
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
        const { paddle, bot, ball } = event;
        setPaddlePosition(paddle);
        setBallPosition(ball);
        setBotPosition(bot);
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
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.fillRect(10, paddlePosition, 20, 100);
        ctx.fillRect(770, botPosition, 20, 100);

        ctx.beginPath();
        ctx.arc(ballPosition.x, ballPosition.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.closePath();
      }
    }
  }, [paddlePosition, ballPosition, botPosition]);



  return (
    <div>
      <canvas ref={canvasRef} width={800} height={600} style={{ backgroundColor: 'black' }}></canvas>
      <div>
        Paddle Position: {paddlePosition}
      </div>
      <button onClick={handleStartGame}>
        Start Game
      </button>
      <button onClick={handleStopGame}>
        Stop Game
      </button>
    </div>
  );
};

export default GameComponent;
