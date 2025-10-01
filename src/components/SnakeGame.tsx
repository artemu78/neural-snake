import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_FOOD = { x: 15, y: 15 };
const INITIAL_DIRECTION = { x: 0, y: -1 };

type Position = { x: number; y: number };
type GameState = 'menu' | 'playing' | 'paused' | 'gameOver';

const SnakeGame = () => {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>(INITIAL_FOOD);
  const [direction, setDirection] = useState<Position>(INITIAL_DIRECTION);
  const [score, setScore] = useState(0);

  // Create audio context for bite sound
  const playBiteSound = useCallback(() => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 400;
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }, []);

  const generateFood = useCallback((snakeBody: Position[]) => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snakeBody.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
  }, []);

  const startGame = () => {
    resetGame();
    setGameState('playing');
  };

  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };
      
      head.x += direction.x;
      head.y += direction.y;

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameState('gameOver');
        return currentSnake;
      }

      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameState('gameOver');
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        playBiteSound();
        setScore(prev => prev + 10);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [gameState, direction, food, generateFood, playBiteSound]);

  // Game loop effect
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const gameInterval = setInterval(gameLoop, 150);
    return () => clearInterval(gameInterval);
  }, [gameLoop, gameState]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState === 'playing') {
        switch (e.key) {
          case 'ArrowUp':
          case 'w':
          case 'W':
            if (direction.y === 0) setDirection({ x: 0, y: -1 });
            break;
          case 'ArrowDown':
          case 's':
          case 'S':
            if (direction.y === 0) setDirection({ x: 0, y: 1 });
            break;
          case 'ArrowLeft':
          case 'a':
          case 'A':
            if (direction.x === 0) setDirection({ x: -1, y: 0 });
            break;
          case 'ArrowRight':
          case 'd':
          case 'D':
            if (direction.x === 0) setDirection({ x: 1, y: 0 });
            break;
          case ' ':
            e.preventDefault();
            setGameState('paused');
            break;
        }
      } else if (gameState === 'paused' && e.key === ' ') {
        e.preventDefault();
        setGameState('playing');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameState]);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Cosmic Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950 via-indigo-950 to-black">
        {/* Animated nebula clouds */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-pink-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-blue-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        {/* Stars */}
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>
      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-neon-flicker mb-4">
            SNAKE
          </h1>
          <div className="text-2xl text-neon-blue font-mono">
            SCORE: <span className="text-neon-pink">{score.toString().padStart(6, '0')}</span>
          </div>
        </div>

        {/* Game Area */}
        <Card className="bg-cyber-medium border-2 border-neon-purple shadow-glow-purple p-6">
          {gameState === 'menu' && (
            <div className="text-center py-20 animate-slide-in">
              <div className="mb-8">
                <div className="text-4xl text-neon-purple mb-4 animate-glow-pulse">
                  NEURAL SNAKE
                </div>
                <div className="text-neon-blue mb-6 space-y-2">
                  <div>Use arrow keys or WASD to move</div>
                  <div>Press SPACEBAR to pause/resume</div>
                  <div>Eat the glowing orbs to grow</div>
                </div>
              </div>
              <Button 
                onClick={startGame}
                className="bg-gradient-primary hover:shadow-glow-strong text-white font-bold px-8 py-4 text-xl transition-all duration-300 hover:scale-105"
              >
                INITIALIZE GAME
              </Button>
            </div>
          )}

          {gameState === 'paused' && (
            <div className="text-center py-20 animate-slide-in">
              <div className="text-4xl text-neon-blue mb-6 animate-glow-pulse">
                SYSTEM PAUSED
              </div>
              <div className="text-neon-purple">
                Press SPACEBAR to resume
              </div>
            </div>
          )}

          {gameState === 'gameOver' && (
            <div className="text-center py-20 animate-slide-in">
              <div className="text-4xl text-neon-pink mb-4 animate-glow-pulse">
                GAME OVER
              </div>
              <div className="text-2xl text-neon-blue mb-6">
                Final Score: <span className="text-neon-purple">{score}</span>
              </div>
              <Button 
                onClick={startGame}
                className="bg-gradient-secondary hover:shadow-glow-strong text-white font-bold px-8 py-4 text-xl transition-all duration-300 hover:scale-105"
              >
                RESTART SYSTEM
              </Button>
            </div>
          )}

          {(gameState === 'playing' || gameState === 'paused') && (
            <div className="relative">
              {/* Game Grid */}
              <div 
                className="grid border border-neon-purple shadow-glow-purple mx-auto"
                style={{
                  gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                  gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
                  width: '500px',
                  height: '500px',
                }}
              >
                {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
                  const x = index % GRID_SIZE;
                  const y = Math.floor(index / GRID_SIZE);
                  
                  const isSnakeHead = snake[0]?.x === x && snake[0]?.y === y;
                  const isSnakeBody = snake.slice(1).some(segment => segment.x === x && segment.y === y);
                  const isFood = food.x === x && food.y === y;

                  let cellClass = "border-cyber-light/20 border-[0.5px] transition-all duration-150 ease-linear relative";
                  
                  if (isSnakeHead) {
                    cellClass += " bg-green-500/20";
                  } else if (isSnakeBody) {
                    cellClass += " bg-green-600/20";
                  } else if (isFood) {
                    cellClass += " bg-neon-blue/20";
                  } else {
                    cellClass += " bg-cyber-dark/50";
                  }

                  return (
                    <div
                      key={index}
                      className={cellClass}
                    >
                      {isSnakeHead && (
                        <>
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 via-green-500 to-green-600 shadow-lg shadow-green-500/50 transition-all duration-150 ease-linear" />
                          <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 bg-yellow-400 rounded-full border border-black/30 transition-all duration-150 ease-linear" />
                          <div className="absolute top-1/4 right-1/4 w-1.5 h-1.5 bg-yellow-400 rounded-full border border-black/30 transition-all duration-150 ease-linear" />
                          <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-2 h-1 bg-red-500/80 rounded-full" />
                        </>
                      )}
                      {isSnakeBody && (
                        <>
                          <div className="absolute inset-1 rounded-full bg-gradient-to-br from-green-500 via-green-600 to-green-700 shadow-lg shadow-green-600/30 transition-all duration-150 ease-linear" />
                          <div className="absolute top-1/4 left-1/3 w-1 h-1 bg-green-800/60 rounded-full" />
                          <div className="absolute top-1/2 right-1/3 w-0.5 h-0.5 bg-green-800/50 rounded-full" />
                          <div className="absolute bottom-1/3 left-1/4 w-0.5 h-0.5 bg-green-800/50 rounded-full" />
                        </>
                      )}
                      {isFood && (
                        <div className="absolute inset-0 flex items-center justify-center animate-glow-pulse transition-all duration-150 ease-linear">
                          <span className="text-3xl">🍌</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Pause overlay */}
              {gameState === 'paused' && (
                <div className="absolute inset-0 bg-cyber-dark/80 flex items-center justify-center">
                  <div className="text-4xl text-neon-blue animate-glow-pulse">
                    PAUSED
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Controls info */}
        <div className="text-center mt-6 text-cyber-light space-y-1">
          <div>Controls: Arrow Keys / WASD to move • SPACEBAR to pause/resume</div>
          <div className="text-neon-purple">Stay within the neural grid boundaries</div>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;