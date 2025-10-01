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
        setScore(prev => prev + 10);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [gameState, direction, food, generateFood]);

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
    <div className="min-h-screen bg-cyber-dark flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
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
                    cellClass += " bg-neon-pink/20";
                  } else if (isSnakeBody) {
                    cellClass += " bg-neon-purple/20";
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
                          <div className="absolute inset-0 rounded-full bg-neon-pink shadow-glow-pink transition-all duration-150 ease-linear" />
                          <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 bg-cyber-dark rounded-full transition-all duration-150 ease-linear" />
                          <div className="absolute top-1/4 right-1/4 w-1.5 h-1.5 bg-cyber-dark rounded-full transition-all duration-150 ease-linear" />
                        </>
                      )}
                      {isSnakeBody && (
                        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-neon-purple to-neon-purple/70 shadow-glow-purple transition-all duration-150 ease-linear" />
                      )}
                      {isFood && (
                        <div className="absolute inset-1 rounded-full bg-neon-blue shadow-glow-blue animate-glow-pulse transition-all duration-150 ease-linear" />
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