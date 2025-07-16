import { Vector2D, GameEntity } from './types'
import Projectile from './Projectile'

class Player implements GameEntity {
  position: Vector2D
  velocity: Vector2D = { x: 0, y: 0 }
  radius = 15
  color = '#6366f1'
  
  private projectiles: Projectile[] = []
  private lastShotTime = 0
  private shotCooldown = 200 // milliseconds
  private trail: Vector2D[] = []
  private maxTrailLength = 10

  constructor(position: Vector2D) {
    this.position = { ...position }
  }

  setVelocity(velocity: Vector2D) {
    this.velocity = velocity
  }

  update(deltaTime: number) {
    // Update position
    this.position.x += this.velocity.x * (deltaTime / 1000)
    this.position.y += this.velocity.y * (deltaTime / 1000)

    // Update trail
    if (this.velocity.x !== 0 || this.velocity.y !== 0) {
      this.trail.unshift({ ...this.position })
      if (this.trail.length > this.maxTrailLength) {
        this.trail.pop()
      }
    }

    // Update projectiles
    this.projectiles.forEach(projectile => projectile.update(deltaTime))
    
    // Remove old projectiles
    this.projectiles = this.projectiles.filter(projectile => 
      projectile.position.x > -50 && 
      projectile.position.x < window.innerWidth + 50 &&
      projectile.position.y > -50 && 
      projectile.position.y < window.innerHeight + 50
    )
  }

  shoot() {
    const currentTime = Date.now()
    if (currentTime - this.lastShotTime < this.shotCooldown) return

    // Create projectile moving upward
    const projectile = new Projectile(
      { ...this.position },
      { x: 0, y: -500 } // Fast upward velocity
    )
    
    this.projectiles.push(projectile)
    this.lastShotTime = currentTime
  }

  getProjectiles(): Projectile[] {
    const projectiles = [...this.projectiles]
    this.projectiles = []
    return projectiles
  }

  render(ctx: CanvasRenderingContext2D) {
    // Render trail
    this.trail.forEach((point, index) => {
      const alpha = (this.maxTrailLength - index) / this.maxTrailLength * 0.3
      const size = (this.maxTrailLength - index) / this.maxTrailLength * this.radius * 0.8
      
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.fillStyle = this.color
      ctx.beginPath()
      ctx.arc(point.x, point.y, size, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    })

    // Render player with glow effect
    ctx.save()
    
    // Outer glow
    const gradient = ctx.createRadialGradient(
      this.position.x, this.position.y, 0,
      this.position.x, this.position.y, this.radius * 2
    )
    gradient.addColorStop(0, this.color + '80')
    gradient.addColorStop(0.5, this.color + '40')
    gradient.addColorStop(1, this.color + '00')
    
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(this.position.x, this.position.y, this.radius * 2, 0, Math.PI * 2)
    ctx.fill()

    // Main body
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
    ctx.fill()

    // Inner highlight
    ctx.fillStyle = '#ffffff40'
    ctx.beginPath()
    ctx.arc(this.position.x - 3, this.position.y - 3, this.radius * 0.6, 0, Math.PI * 2)
    ctx.fill()

    // Pulsing ring
    const pulseRadius = this.radius + Math.sin(Date.now() * 0.01) * 5
    ctx.strokeStyle = this.color + '60'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(this.position.x, this.position.y, pulseRadius, 0, Math.PI * 2)
    ctx.stroke()

    ctx.restore()
  }
}

export default Player