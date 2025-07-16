import { Vector2D, GameEntity } from './types'

class Enemy implements GameEntity {
  position: Vector2D
  velocity: Vector2D = { x: 0, y: 0 }
  radius = 12
  color = '#ef4444'
  
  private speed = 80 // pixels per second
  private rotationSpeed = 0.05
  private rotation = 0
  private pulsePhase = Math.random() * Math.PI * 2

  constructor(position: Vector2D) {
    this.position = { ...position }
    this.pulsePhase = Math.random() * Math.PI * 2
  }

  moveTowards(target: Vector2D) {
    const dx = target.x - this.position.x
    const dy = target.y - this.position.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance > 0) {
      this.velocity.x = (dx / distance) * this.speed
      this.velocity.y = (dy / distance) * this.speed
    }
  }

  update(deltaTime: number) {
    // Update position
    this.position.x += this.velocity.x * (deltaTime / 1000)
    this.position.y += this.velocity.y * (deltaTime / 1000)

    // Update rotation
    this.rotation += this.rotationSpeed * (deltaTime / 16.67) // Normalize to 60fps
    
    // Update pulse phase
    this.pulsePhase += 0.1 * (deltaTime / 16.67)
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.translate(this.position.x, this.position.y)
    ctx.rotate(this.rotation)

    // Outer glow with pulsing effect
    const pulseIntensity = 0.5 + Math.sin(this.pulsePhase) * 0.3
    const glowRadius = this.radius * (1.5 + pulseIntensity * 0.5)
    
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowRadius)
    gradient.addColorStop(0, this.color + '80')
    gradient.addColorStop(0.6, this.color + '40')
    gradient.addColorStop(1, this.color + '00')
    
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(0, 0, glowRadius, 0, Math.PI * 2)
    ctx.fill()

    // Main body - hexagonal shape
    ctx.fillStyle = this.color
    ctx.beginPath()
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3
      const x = Math.cos(angle) * this.radius
      const y = Math.sin(angle) * this.radius
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()
    ctx.fill()

    // Inner core
    ctx.fillStyle = '#ff6666'
    ctx.beginPath()
    ctx.arc(0, 0, this.radius * 0.6, 0, Math.PI * 2)
    ctx.fill()

    // Rotating spikes
    ctx.strokeStyle = this.color
    ctx.lineWidth = 2
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4
      const innerRadius = this.radius * 0.8
      const outerRadius = this.radius * 1.3
      
      ctx.beginPath()
      ctx.moveTo(
        Math.cos(angle) * innerRadius,
        Math.sin(angle) * innerRadius
      )
      ctx.lineTo(
        Math.cos(angle) * outerRadius,
        Math.sin(angle) * outerRadius
      )
      ctx.stroke()
    }

    // Pulsing energy ring
    const ringRadius = this.radius + Math.sin(this.pulsePhase * 2) * 3
    ctx.strokeStyle = this.color + '80'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(0, 0, ringRadius, 0, Math.PI * 2)
    ctx.stroke()

    ctx.restore()
  }
}

export default Enemy