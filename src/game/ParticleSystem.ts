import { Vector2D, Particle } from './types'

interface ParticleOptions {
  position: Vector2D
  velocity: Vector2D
  color: string
  life: number
  size: number
}

class ParticleSystem {
  private particles: Particle[] = []

  emit(options: ParticleOptions) {
    const particle: Particle = {
      position: { ...options.position },
      velocity: { ...options.velocity },
      color: options.color,
      life: options.life,
      maxLife: options.life,
      size: options.size,
      alpha: 1
    }
    
    this.particles.push(particle)
  }

  emitBurst(position: Vector2D, count: number, options: Partial<ParticleOptions> = {}) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5
      const speed = 50 + Math.random() * 150
      
      this.emit({
        position: { ...position },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
        },
        color: options.color || '#ffffff',
        life: options.life || 1000 + Math.random() * 500,
        size: options.size || 2 + Math.random() * 3
      })
    }
  }

  update(deltaTime: number) {
    this.particles.forEach(particle => {
      // Update position
      particle.position.x += particle.velocity.x * (deltaTime / 1000)
      particle.position.y += particle.velocity.y * (deltaTime / 1000)

      // Apply gravity and friction
      particle.velocity.y += 100 * (deltaTime / 1000) // Gravity
      particle.velocity.x *= 0.98 // Friction
      particle.velocity.y *= 0.98

      // Update life and alpha
      particle.life -= deltaTime
      particle.alpha = Math.max(0, particle.life / particle.maxLife)
      
      // Shrink over time
      particle.size *= 0.995
    })

    // Remove dead particles
    this.particles = this.particles.filter(particle => particle.life > 0 && particle.size > 0.1)
  }

  render(ctx: CanvasRenderingContext2D) {
    this.particles.forEach(particle => {
      ctx.save()
      ctx.globalAlpha = particle.alpha

      // Create gradient for glow effect
      const gradient = ctx.createRadialGradient(
        particle.position.x, particle.position.y, 0,
        particle.position.x, particle.position.y, particle.size * 2
      )
      gradient.addColorStop(0, particle.color)
      gradient.addColorStop(0.5, particle.color + '80')
      gradient.addColorStop(1, particle.color + '00')

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(particle.position.x, particle.position.y, particle.size * 2, 0, Math.PI * 2)
      ctx.fill()

      // Bright center
      ctx.fillStyle = particle.color
      ctx.beginPath()
      ctx.arc(particle.position.x, particle.position.y, particle.size, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    })
  }

  getParticleCount(): number {
    return this.particles.length
  }

  clear() {
    this.particles = []
  }
}

export default ParticleSystem