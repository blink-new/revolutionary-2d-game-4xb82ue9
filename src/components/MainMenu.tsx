import React from 'react'
import { Play, Settings, Trophy, Gamepad2 } from 'lucide-react'

interface MainMenuProps {
  onStartGame: () => void
  onShowSettings: () => void
  onShowLeaderboard: () => void
  highScore: number
}

const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onShowSettings,
  onShowLeaderboard,
  highScore
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-indigo-400/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center max-w-md mx-auto px-6">
        {/* Game Logo */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <Gamepad2 className="w-16 h-16 text-indigo-400 mr-4" />
            <div className="text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-amber-400 bg-clip-text text-transparent">
                NEXUS
              </h1>
              <p className="text-sm text-slate-400 font-mono">REVOLUTION</p>
            </div>
          </div>
          <p className="text-slate-300 text-sm">
            Experience the future of 2D gaming
          </p>
        </div>

        {/* High Score Display */}
        {highScore > 0 && (
          <div className="mb-8 p-4 bg-slate-900/50 rounded-lg border border-amber-500/30">
            <p className="text-amber-400 font-mono">
              Best Score: {highScore.toLocaleString()}
            </p>
          </div>
        )}

        {/* Menu Buttons */}
        <div className="space-y-4">
          <button
            onClick={onStartGame}
            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg shadow-indigo-500/25"
          >
            <Play className="w-5 h-5" />
            <span className="text-lg font-semibold">Start Game</span>
          </button>

          <button
            onClick={onShowLeaderboard}
            className="w-full flex items-center justify-center gap-3 px-8 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all duration-200 border border-slate-600"
          >
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Leaderboard</span>
          </button>

          <button
            onClick={onShowSettings}
            className="w-full flex items-center justify-center gap-3 px-8 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all duration-200 border border-slate-600"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </div>

        {/* Version Info */}
        <div className="mt-12 text-xs text-slate-500 font-mono">
          v1.0.0 • Built with React & Canvas
        </div>
      </div>
    </div>
  )
}

export default MainMenu