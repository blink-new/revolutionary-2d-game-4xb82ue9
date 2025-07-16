import { Vector2D, LightSource } from './types'

class LightingSystem {
  private ctx: CanvasRenderingContext2D
  private lights: LightSource[] = []
  private lightCanvas: HTMLCanvasElement
  private lightCtx: CanvasRenderingContext2D

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx
    
    // Create off-screen canvas for lighting calculations
    this.lightCanvas = document.createElement('canvas')
    this.lightCtx = this.lightCanvas.getContext('2d')!
    
    this.resizeLightCanvas()
  }

  private resizeLightCanvas() {
    this.lightCanvas.width = this.ctx.canvas.width
    this.lightCanvas.height = this.ctx.canvas.height
  }

  addLight(position: Vector2D, radius: number, color: string, intensity: number = 1.0) {
    this.lights.push({
      position: { ...position },
      radius,
      color,
      intensity
    })
  }

  beginLighting() {
    // Resize if needed
    if (this.lightCanvas.width !== this.ctx.canvas.width || 
        this.lightCanvas.height !== this.ctx.canvas.height) {
      this.resizeLightCanvas()
    }

    // Clear lights
    this.lights = []
    
    // Clear light canvas with dark ambient
    this.lightCtx.fillStyle = '#000000'
    this.lightCtx.fillRect(0, 0, this.lightCanvas.width, this.lightCanvas.height)
  }

  update(deltaTime: number) {
    // Add ambient lighting effects
    this.addAmbientEffects()
  }

  private addAmbientEffects() {
    // Add subtle ambient particles
    const time = Date.now() * 0.001
    
    for (let i = 0; i < 5; i++) {
      const x = (Math.sin(time * 0.5 + i) * 0.5 + 0.5) * this.lightCanvas.width
      const y = (Math.cos(time * 0.3 + i * 2) * 0.5 + 0.5) * this.lightCanvas.height
      
      this.addLight(
        { x, y },
        20 + Math.sin(time * 2 + i) * 10,
        '#6366f1',
        0.1 + Math.sin(time * 3 + i) * 0.05
      )
    }
  }

  applyLighting() {
    // Render all lights to the light canvas
    this.lightCtx.globalCompositeOperation = 'lighter'
    
    this.lights.forEach(light => {
      this.renderLight(light)
    })

    // Apply lighting to main canvas
    this.ctx.save()
    this.ctx.globalCompositeOperation = 'multiply'
    this.ctx.globalAlpha = 0.8
    this.ctx.drawImage(this.lightCanvas, 0, 0)
    this.ctx.restore()

    // Add glow effects
    this.ctx.save()
    this.ctx.globalCompositeOperation = 'screen'
    this.ctx.globalAlpha = 0.3
    this.ctx.drawImage(this.lightCanvas, 0, 0)
    this.ctx.restore()
  }

  private renderLight(light: LightSource) {
    const gradient = this.lightCtx.createRadialGradient(
      light.position.x, light.position.y, 0,
      light.position.x, light.position.y, light.radius
    )

    // Parse color and apply intensity
    const alpha = Math.min(1, light.intensity)
    gradient.addColorStop(0, light.color + Math.floor(alpha * 255).toString(16).padStart(2, '0'))
    gradient.addColorStop(0.5, light.color + Math.floor(alpha * 128).toString(16).padStart(2, '0'))
    gradient.addColorStop(1, light.color + '00')

    this.lightCtx.fillStyle = gradient
    this.lightCtx.beginPath()
    this.lightCtx.arc(light.position.x, light.position.y, light.radius, 0, Math.PI * 2)
    this.lightCtx.fill()

    // Add inner bright core
    const coreGradient = this.lightCtx.createRadialGradient(
      light.position.x, light.position.y, 0,
      light.position.x, light.position.y, light.radius * 0.3
    )
    
    coreGradient.addColorStop(0, '#ffffff' + Math.floor(alpha * 128).toString(16).padStart(2, '0'))
    coreGradient.addColorStop(1, light.color + '00')

    this.lightCtx.fillStyle = coreGradient
    this.lightCtx.beginPath()
    this.lightCtx.arc(light.position.x, light.position.y, light.radius * 0.3, 0, Math.PI * 2)
    this.lightCtx.fill()
  }

  // Add dynamic lighting effects
  addFlicker(position: Vector2D, baseRadius: number, color: string) {
    const flickerIntensity = 0.8 + Math.random() * 0.4
    const flickerRadius = baseRadius * (0.8 + Math.random() * 0.4)
    
    this.addLight(position, flickerRadius, color, flickerIntensity)
  }

  addPulse(position: Vector2D, baseRadius: number, color: string, frequency: number = 1) {
    const time = Date.now() * 0.001
    const pulseIntensity = 0.5 + Math.sin(time * frequency * Math.PI * 2) * 0.5
    const pulseRadius = baseRadius * (0.8 + pulseIntensity * 0.4)
    
    this.addLight(position, pulseRadius, color, pulseIntensity)
  }
}

export default LightingSystem