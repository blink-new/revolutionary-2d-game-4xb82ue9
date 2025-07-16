import { Vector2D, GameEntity } from './types'

class Projectile implements GameEntity {
  position: Vector2D
  velocity: Vector2D
  radius = 4
  color = '#f59e0b'
  
  private trail: Vector2D[] = []
  private maxTrailLength = 8
  private life = 3000 // 3 seconds
  private maxLife = 3000

  constructor(position: Vector2D, velocity: Vector2D) {
    this.position = { ...position }
    this.velocity = { ...velocity }
  }

  update(deltaTime: number) {
    // Update position
    this.position.x += this.velocity.x * (deltaTime / 1000)
    this.position.y += this.velocity.y * (deltaTime / 1000)

    // Update trail
    this.trail.unshift({ ...this.position })
    if (this.trail.length > this.maxTrailLength) {
      this.trail.pop()
    }

    // Update life
    this.life -= deltaTime
  }

  render(ctx: CanvasRenderingContext2D) {
    // Render trail
    this.trail.forEach((point, index) => {
      const alpha = (this.maxTrailLength - index) / this.maxTrailLength * 0.6
      const size = (this.maxTrailLength - index) / this.maxTrailLength * this.radius
      
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.fillStyle = this.color
      ctx.beginPath()
      ctx.arc(point.x, point.y, size, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    })

    // Render projectile with glow
    ctx.save()
    
    // Outer glow
    const gradient = ctx.createRadialGradient(
      this.position.x, this.position.y, 0,
      this.position.x, this.position.y, this.radius * 3
    )
    gradient.addColorStop(0, this.color + 'ff')
    gradient.addColorStop(0.3, this.color + '80')
    gradient.addColorStop(1, this.color + '00')
    
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(this.position.x, this.position.y, this.radius * 3, 0, Math.PI * 2)
    ctx.fill()

    // Main projectile
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
    ctx.fill()

    // Inner bright core
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(this.position.x, this.position.y, this.radius * 0.5, 0, Math.PI * 2)
    ctx.fill()

    // Sparkling effect
    const sparkles = 4
    for (let i = 0; i < sparkles; i++) {
      const angle = (Date.now() * 0.01 + i * Math.PI / 2) % (Math.PI * 2)
      const distance = this.radius * 1.5
      const sparkleX = this.position.x + Math.cos(angle) * distance
      const sparkleY = this.position.y + Math.sin(angle) * distance
      
      ctx.fillStyle = '#ffffff80'
      ctx.beginPath()
      ctx.arc(sparkleX, sparkleY, 1, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.restore()
  }
}

export default Projectile