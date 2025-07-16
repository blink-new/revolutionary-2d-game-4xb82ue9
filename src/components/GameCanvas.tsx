import React, { useRef, useEffect, useCallback, useState } from 'react'
import { Pause, Volume2 } from 'lucide-react'
import GameEngine from '../game/GameEngine'

interface GameCanvasProps {
  onGameOver: (score: number) => void
  onPause: () => void
  currentScore: number
  onScoreUpdate: (score: number) => void
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  onGameOver,
  onPause,
  currentScore,
  onScoreUpdate
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameEngineRef = useRef<GameEngine | null>(null)
  const [fps, setFps] = useState(60)
  const [isLoading, setIsLoading] = useState(true)

  const initializeGame = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) {
      console.error('Canvas not found')
      setIsLoading(false)
      return
    }

    try {
      console.log('Initializing game...')
      
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.error('Game initialization timeout')
        setIsLoading(false)
      }, 10000) // 10 second timeout
      
      // Set canvas size to full viewport
      const resizeCanvas = () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        console.log(`Canvas resized to: ${canvas.width}x${canvas.height}`)
      }

      resizeCanvas()
      window.addEventListener('resize', resizeCanvas)

      // Small delay to ensure canvas is ready
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Test if canvas context is working
      const testCtx = canvas.getContext('2d')
      if (!testCtx) {
        throw new Error('Failed to get 2D context')
      }
      
      // Test basic drawing
      testCtx.fillStyle = '#ff0000'
      testCtx.fillRect(10, 10, 50, 50)
      console.log('Canvas test drawing successful')

      console.log('Creating game engine...')
      
      // Initialize game engine
      gameEngineRef.current = new GameEngine(canvas, {
        onGameOver,
        onScoreUpdate,
        onFpsUpdate: setFps
      })

      console.log('Starting game engine...')
      gameEngineRef.current.start()
      
      console.log('Game initialized successfully!')
      clearTimeout(timeoutId)
      setIsLoading(false)

      return () => {
        clearTimeout(timeoutId)
        window.removeEventListener('resize', resizeCanvas)
        gameEngineRef.current?.stop()
      }
    } catch (error) {
      console.error('Failed to initialize game:', error)
      clearTimeout(timeoutId)
      setIsLoading(false)
    }
  }, [onGameOver, onScoreUpdate])

  useEffect(() => {
    let cleanup: (() => void) | undefined
    
    initializeGame().then((cleanupFn) => {
      cleanup = cleanupFn
    }).catch(console.error)
    
    return () => {
      cleanup?.()
    }
  }, [initializeGame])

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Escape') {
        e.preventDefault()
        onPause()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [onPause])

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-indigo-400 font-mono">Initializing Game Engine...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-slate-950 overflow-hidden">
      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair"
        style={{ touchAction: 'none' }}
      />

      {/* Game HUD */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="flex justify-between items-start">
          {/* Score Display */}
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg p-3 border border-indigo-500/30">
            <div className="text-sm text-slate-400 font-mono">SCORE</div>
            <div className="text-2xl font-bold text-indigo-400 font-mono">
              {currentScore.toLocaleString()}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <button
              onClick={onPause}
              className="bg-slate-900/80 backdrop-blur-sm p-3 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
              title="Pause (Space/Esc)"
            >
              <Pause className="w-5 h-5" />
            </button>
            <button className="bg-slate-900/80 backdrop-blur-sm p-3 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors">
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Performance HUD */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-slate-900/60 backdrop-blur-sm rounded px-3 py-1 text-xs font-mono text-slate-400">
          FPS: {fps}
        </div>
      </div>

      {/* Mobile Controls */}
      <div className="absolute bottom-4 right-4 z-10 md:hidden">
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg p-4 border border-slate-600">
          <div className="text-xs text-slate-400 mb-2 text-center">Touch to move</div>
          <div className="w-16 h-16 bg-slate-800 rounded-full border-2 border-indigo-500/50 flex items-center justify-center">
            <div className="w-6 h-6 bg-indigo-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-slate-900/60 backdrop-blur-sm rounded px-4 py-2 text-sm text-slate-400 font-mono">
          <span className="hidden md:inline">WASD/Arrow Keys to move • Space to pause</span>
          <span className="md:hidden">Touch to move • Tap pause button</span>
        </div>
      </div>
    </div>
  )
}

export default GameCanvas