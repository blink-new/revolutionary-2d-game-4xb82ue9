import React, { useState } from 'react'
import GameCanvas from './components/GameCanvas'
import MainMenu from './components/MainMenu'
import Settings from './components/Settings'
import Leaderboard from './components/Leaderboard'
import './App.css'

type GameState = 'menu' | 'playing' | 'settings' | 'leaderboard' | 'paused' | 'gameOver'

function App() {
  const [gameState, setGameState] = useState<GameState>('menu')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('highScore')
    return saved ? parseInt(saved) : 0
  })

  const handleGameStart = () => {
    setGameState('playing')
    setScore(0)
  }

  const handleGameOver = (finalScore: number) => {
    setScore(finalScore)
    if (finalScore > highScore) {
      setHighScore(finalScore)
      localStorage.setItem('highScore', finalScore.toString())
    }
    setGameState('gameOver')
  }

  const handleBackToMenu = () => {
    setGameState('menu')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {gameState === 'menu' && (
        <MainMenu
          onStartGame={handleGameStart}
          onShowSettings={() => setGameState('settings')}
          onShowLeaderboard={() => setGameState('leaderboard')}
          highScore={highScore}
        />
      )}
      
      {gameState === 'playing' && (
        <GameCanvas
          onGameOver={handleGameOver}
          onPause={() => setGameState('paused')}
          currentScore={score}
          onScoreUpdate={setScore}
        />
      )}
      
      {gameState === 'settings' && (
        <Settings onBack={handleBackToMenu} />
      )}
      
      {gameState === 'leaderboard' && (
        <Leaderboard onBack={handleBackToMenu} highScore={highScore} />
      )}
      
      {gameState === 'paused' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-slate-900 p-8 rounded-lg border border-indigo-500/30">
            <h2 className="text-2xl font-bold mb-4 text-center">Game Paused</h2>
            <div className="flex gap-4">
              <button
                onClick={() => setGameState('playing')}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                Resume
              </button>
              <button
                onClick={handleBackToMenu}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                Main Menu
              </button>
            </div>
          </div>
        </div>
      )}
      
      {gameState === 'gameOver' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-slate-900 p-8 rounded-lg border border-amber-500/30 text-center">
            <h2 className="text-3xl font-bold mb-4 text-amber-400">Game Over!</h2>
            <p className="text-xl mb-2">Score: {score}</p>
            <p className="text-lg mb-6 text-slate-300">High Score: {highScore}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleGameStart}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                Play Again
              </button>
              <button
                onClick={handleBackToMenu}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                Main Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App