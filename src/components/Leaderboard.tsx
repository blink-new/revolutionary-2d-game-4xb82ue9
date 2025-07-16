import React, { useState, useEffect } from 'react'
import { ArrowLeft, Trophy, Medal, Award, Star } from 'lucide-react'

interface LeaderboardProps {
  onBack: () => void
  highScore: number
}

interface ScoreEntry {
  id: string
  name: string
  score: number
  date: string
  rank: number
}

const Leaderboard: React.FC<LeaderboardProps> = ({ onBack, highScore }) => {
  const [scores, setScores] = useState<ScoreEntry[]>([])
  const [playerName, setPlayerName] = useState('')
  const [showNameInput, setShowNameInput] = useState(false)

  useEffect(() => {
    // Load scores from localStorage
    const savedScores = localStorage.getItem('leaderboard')
    if (savedScores) {
      const parsedScores = JSON.parse(savedScores)
      setScores(parsedScores.sort((a: ScoreEntry, b: ScoreEntry) => b.score - a.score))
    }

    // Load player name
    const savedName = localStorage.getItem('playerName')
    if (savedName) {
      setPlayerName(savedName)
    }
  }, [])

  const handleSubmitScore = () => {
    if (!playerName.trim() || highScore === 0) return

    const newEntry: ScoreEntry = {
      id: Date.now().toString(),
      name: playerName.trim(),
      score: highScore,
      date: new Date().toLocaleDateString(),
      rank: 0
    }

    const updatedScores = [...scores, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10) // Keep only top 10
      .map((entry, index) => ({ ...entry, rank: index + 1 }))

    setScores(updatedScores)
    localStorage.setItem('leaderboard', JSON.stringify(updatedScores))
    localStorage.setItem('playerName', playerName)
    setShowNameInput(false)
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-400" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return <Star className="w-5 h-5 text-slate-500" />
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'border-yellow-500/50 bg-yellow-500/10'
      case 2:
        return 'border-gray-400/50 bg-gray-400/10'
      case 3:
        return 'border-amber-600/50 bg-amber-600/10'
      default:
        return 'border-slate-600'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center p-6">
      <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg border border-slate-700 p-8 max-w-md w-full">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="mr-4 p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold">Leaderboard</h2>
          </div>
        </div>

        {/* Current Score */}
        {highScore > 0 && (
          <div className="mb-6 p-4 bg-indigo-500/20 border border-indigo-500/30 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">Your Best Score</div>
              <div className="text-2xl font-bold text-indigo-400">
                {highScore.toLocaleString()}
              </div>
              {!scores.some(s => s.score === highScore) && (
                <button
                  onClick={() => setShowNameInput(true)}
                  className="mt-2 px-4 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-sm transition-colors"
                >
                  Submit to Leaderboard
                </button>
              )}
            </div>
          </div>
        )}

        {/* Name Input Modal */}
        {showNameInput && (
          <div className="mb-6 p-4 bg-slate-800 border border-slate-600 rounded-lg">
            <div className="text-sm text-slate-400 mb-2">Enter your name:</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Your name"
                className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm focus:border-indigo-500 focus:outline-none"
                maxLength={20}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmitScore()}
              />
              <button
                onClick={handleSubmitScore}
                disabled={!playerName.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded text-sm transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        )}

        {/* Scores List */}
        <div className="space-y-3">
          {scores.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No scores yet!</p>
              <p className="text-sm">Play the game to set the first record.</p>
            </div>
          ) : (
            scores.map((entry) => (
              <div
                key={entry.id}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${getRankColor(entry.rank)}`}
              >
                <div className="flex items-center gap-2">
                  {getRankIcon(entry.rank)}
                  <span className="font-bold text-lg">#{entry.rank}</span>
                </div>
                
                <div className="flex-1">
                  <div className="font-semibold">{entry.name}</div>
                  <div className="text-xs text-slate-400">{entry.date}</div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-lg">
                    {entry.score.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400">points</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Clear Scores */}
        {scores.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-700">
            <button
              onClick={() => {
                localStorage.removeItem('leaderboard')
                setScores([])
              }}
              className="w-full py-2 text-slate-400 hover:text-red-400 transition-colors text-sm"
            >
              Clear All Scores
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Leaderboard