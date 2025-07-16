import React, { useState } from 'react'
import { ArrowLeft, Volume2, VolumeX, Monitor, Smartphone } from 'lucide-react'

interface SettingsProps {
  onBack: () => void
}

const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('soundEnabled')
    return saved ? JSON.parse(saved) : true
  })

  const [graphics, setGraphics] = useState(() => {
    const saved = localStorage.getItem('graphics')
    return saved || 'high'
  })

  const [controls, setControls] = useState(() => {
    const saved = localStorage.getItem('controls')
    return saved || 'keyboard'
  })

  const handleSoundToggle = () => {
    const newValue = !soundEnabled
    setSoundEnabled(newValue)
    localStorage.setItem('soundEnabled', JSON.stringify(newValue))
  }

  const handleGraphicsChange = (value: string) => {
    setGraphics(value)
    localStorage.setItem('graphics', value)
  }

  const handleControlsChange = (value: string) => {
    setControls(value)
    localStorage.setItem('controls', value)
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
          <h2 className="text-2xl font-bold">Settings</h2>
        </div>

        {/* Settings Options */}
        <div className="space-y-6">
          {/* Sound */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-indigo-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-500" />
              )}
              <span>Sound Effects</span>
            </div>
            <button
              onClick={handleSoundToggle}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                soundEnabled ? 'bg-indigo-600' : 'bg-slate-600'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  soundEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Graphics Quality */}
          <div>
            <label className="block text-sm font-medium mb-3">Graphics Quality</label>
            <div className="space-y-2">
              {['low', 'medium', 'high'].map((option) => (
                <button
                  key={option}
                  onClick={() => handleGraphicsChange(option)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    graphics === option
                      ? 'border-indigo-500 bg-indigo-500/20'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="capitalize">{option}</span>
                    {graphics === option && (
                      <div className="w-2 h-2 bg-indigo-400 rounded-full" />
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {option === 'low' && 'Better performance, fewer effects'}
                    {option === 'medium' && 'Balanced performance and visuals'}
                    {option === 'high' && 'Best visuals, may impact performance'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div>
            <label className="block text-sm font-medium mb-3">Control Scheme</label>
            <div className="space-y-2">
              <button
                onClick={() => handleControlsChange('keyboard')}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  controls === 'keyboard'
                    ? 'border-indigo-500 bg-indigo-500/20'
                    : 'border-slate-600 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5" />
                  <div>
                    <div>Keyboard & Mouse</div>
                    <div className="text-xs text-slate-400">WASD + Mouse</div>
                  </div>
                  {controls === 'keyboard' && (
                    <div className="ml-auto w-2 h-2 bg-indigo-400 rounded-full" />
                  )}
                </div>
              </button>

              <button
                onClick={() => handleControlsChange('touch')}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  controls === 'touch'
                    ? 'border-indigo-500 bg-indigo-500/20'
                    : 'border-slate-600 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5" />
                  <div>
                    <div>Touch Controls</div>
                    <div className="text-xs text-slate-400">Optimized for mobile</div>
                  </div>
                  {controls === 'touch' && (
                    <div className="ml-auto w-2 h-2 bg-indigo-400 rounded-full" />
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Key Bindings */}
          <div>
            <label className="block text-sm font-medium mb-3">Key Bindings</label>
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Move</span>
                <span className="font-mono text-slate-400">WASD / Arrow Keys</span>
              </div>
              <div className="flex justify-between">
                <span>Shoot</span>
                <span className="font-mono text-slate-400">Space / Click</span>
              </div>
              <div className="flex justify-between">
                <span>Pause</span>
                <span className="font-mono text-slate-400">Esc</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <div className="mt-8 pt-6 border-t border-slate-700">
          <button
            onClick={() => {
              localStorage.removeItem('soundEnabled')
              localStorage.removeItem('graphics')
              localStorage.removeItem('controls')
              setSoundEnabled(true)
              setGraphics('high')
              setControls('keyboard')
            }}
            className="w-full py-2 text-slate-400 hover:text-white transition-colors"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings