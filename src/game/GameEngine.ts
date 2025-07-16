import ParticleSystem from './ParticleSystem'
import Player from './Player'
import Enemy from './Enemy'
import Projectile from './Projectile'
import LightingSystem from './LightingSystem'
import { Vector2D, GameEntity } from './types'

interface GameEngineOptions {
  onGameOver: (score: number) => void
  onScoreUpdate: (score: number) => void
  onFpsUpdate: (fps: number) => void
}

class GameEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private options: GameEngineOptions
  private isRunning = false
  private lastTime = 0
  private fps = 0
  private frameCount = 0
  private lastFpsTime = 0

  // Game entities
  private player: Player
  private enemies: Enemy[] = []
  private projectiles: Projectile[] = []
  private particleSystem: ParticleSystem
  private lightingSystem: LightingSystem

  // Game state
  private score = 0
  private level = 1
  private enemySpawnTimer = 0
  private enemySpawnRate = 2000 // milliseconds
  private keys: Set<string> = new Set()
  private mousePos: Vector2D = { x: 0, y: 0 }
  private touches: Map<number, Vector2D> = new Map()

  constructor(canvas: HTMLCanvasElement, options: GameEngineOptions) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Could not get 2D context from canvas')
    }
    this.ctx = ctx
    this.options = options

    // Initialize game systems
    this.particleSystem = new ParticleSystem()
    this.lightingSystem = new LightingSystem(this.ctx)
    
    // Initialize player at center
    this.player = new Player({
      x: canvas.width / 2,
      y: canvas.height / 2
    })

    this.setupEventListeners()
  }

  private setupEventListeners() {
    // Keyboard events
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code)
      if (e.code === 'Space') {
        e.preventDefault()
        this.player.shoot()
      }
    })

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code)
    })

    // Mouse events
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect()
      this.mousePos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    })

    this.canvas.addEventListener('click', (e) => {
      e.preventDefault()
      this.player.shoot()
    })

    // Touch events for mobile
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault()
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i]
        const rect = this.canvas.getBoundingClientRect()
        this.touches.set(touch.identifier, {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top
        })
      }
    })

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault()
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i]
        const rect = this.canvas.getBoundingClientRect()
        this.touches.set(touch.identifier, {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top
        })
      }
    })

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault()
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i]
        this.touches.delete(touch.identifier)
      }
    })
  }

  start() {
    console.log('GameEngine.start() called')
    this.isRunning = true
    this.lastTime = performance.now()
    console.log('Starting game loop...')
    this.gameLoop(this.lastTime)
  }

  stop() {
    this.isRunning = false
  }

  private gameLoop = (currentTime: number) => {
    if (!this.isRunning) {
      console.log('Game loop stopped')
      return
    }

    const deltaTime = currentTime - this.lastTime
    this.lastTime = currentTime

    // Calculate FPS
    this.frameCount++
    if (currentTime - this.lastFpsTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastFpsTime))
      this.options.onFpsUpdate(this.fps)
      this.frameCount = 0
      this.lastFpsTime = currentTime
      if (this.frameCount % 60 === 0) { // Log less frequently
        console.log(`FPS: ${this.fps}`)
      }
    }

    try {
      this.update(deltaTime)
      this.render()
    } catch (error) {
      console.error('Error in game loop:', error)
      this.isRunning = false
      return
    }

    requestAnimationFrame(this.gameLoop)
  }

  private update(deltaTime: number) {
    // Handle input
    this.handleInput()

    // Update player
    this.player.update(deltaTime)

    // Spawn enemies
    this.enemySpawnTimer += deltaTime
    if (this.enemySpawnTimer >= this.enemySpawnRate) {
      this.spawnEnemy()
      this.enemySpawnTimer = 0
      
      // Increase difficulty over time
      if (this.enemySpawnRate > 500) {
        this.enemySpawnRate -= 10
      }
    }

    // Update enemies
    this.enemies.forEach(enemy => {
      enemy.update(deltaTime)
      enemy.moveTowards(this.player.position)
    })

    // Update projectiles
    this.projectiles.forEach(projectile => {
      projectile.update(deltaTime)
    })

    // Check collisions
    this.checkCollisions()

    // Remove dead entities
    this.cleanup()

    // Update particle system
    this.particleSystem.update(deltaTime)

    // Update lighting
    this.lightingSystem.update(deltaTime)
  }

  private handleInput() {
    const velocity: Vector2D = { x: 0, y: 0 }
    const speed = 300 // pixels per second

    // Keyboard input
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) velocity.y -= speed
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) velocity.y += speed
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) velocity.x -= speed
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) velocity.x += speed

    // Touch input (mobile)
    if (this.touches.size > 0) {
      const touch = this.touches.values().next().value
      const dx = touch.x - this.player.position.x
      const dy = touch.y - this.player.position.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance > 50) { // Dead zone
        velocity.x = (dx / distance) * speed
        velocity.y = (dy / distance) * speed
      }
    }

    // Normalize diagonal movement
    if (velocity.x !== 0 && velocity.y !== 0) {
      const magnitude = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y)
      velocity.x = (velocity.x / magnitude) * speed
      velocity.y = (velocity.y / magnitude) * speed
    }

    this.player.setVelocity(velocity)

    // Keep player in bounds
    const padding = 20
    this.player.position.x = Math.max(padding, Math.min(this.canvas.width - padding, this.player.position.x))
    this.player.position.y = Math.max(padding, Math.min(this.canvas.height - padding, this.player.position.y))
  }

  private spawnEnemy() {
    const side = Math.floor(Math.random() * 4)
    let x, y

    switch (side) {
      case 0: // Top
        x = Math.random() * this.canvas.width
        y = -50
        break
      case 1: // Right
        x = this.canvas.width + 50
        y = Math.random() * this.canvas.height
        break
      case 2: // Bottom
        x = Math.random() * this.canvas.width
        y = this.canvas.height + 50
        break
      case 3: // Left
        x = -50
        y = Math.random() * this.canvas.height
        break
      default:
        x = 0
        y = 0
    }

    this.enemies.push(new Enemy({ x, y }))
  }

  private checkCollisions() {
    // Player vs Enemies
    this.enemies.forEach((enemy, enemyIndex) => {
      if (this.isColliding(this.player, enemy)) {
        // Game over
        this.createExplosion(this.player.position, '#ff4444', 20)
        this.options.onGameOver(this.score)
        return
      }

      // Projectiles vs Enemies
      this.projectiles.forEach((projectile, projectileIndex) => {
        if (this.isColliding(projectile, enemy)) {
          // Enemy destroyed
          this.createExplosion(enemy.position, '#44ff44', 15)
          this.enemies.splice(enemyIndex, 1)
          this.projectiles.splice(projectileIndex, 1)
          
          this.score += 100
          this.options.onScoreUpdate(this.score)
        }
      })
    })
  }

  private isColliding(entity1: GameEntity, entity2: GameEntity): boolean {
    const dx = entity1.position.x - entity2.position.x
    const dy = entity1.position.y - entity2.position.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    return distance < (entity1.radius + entity2.radius)
  }

  private createExplosion(position: Vector2D, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count
      const speed = 100 + Math.random() * 200
      this.particleSystem.emit({
        position: { ...position },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
        },
        color,
        life: 1000 + Math.random() * 500,
        size: 2 + Math.random() * 4
      })
    }
  }

  private cleanup() {
    // Remove off-screen projectiles
    this.projectiles = this.projectiles.filter(projectile => 
      projectile.position.x > -50 && 
      projectile.position.x < this.canvas.width + 50 &&
      projectile.position.y > -50 && 
      projectile.position.y < this.canvas.height + 50
    )

    // Remove off-screen enemies (with larger buffer)
    this.enemies = this.enemies.filter(enemy => 
      enemy.position.x > -100 && 
      enemy.position.x < this.canvas.width + 100 &&
      enemy.position.y > -100 && 
      enemy.position.y < this.canvas.height + 100
    )
  }

  private render() {
    // Clear canvas with dark background
    this.ctx.fillStyle = '#0f0f23'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // Apply lighting effects
    this.lightingSystem.beginLighting()

    // Add light sources
    this.lightingSystem.addLight(this.player.position, 100, '#6366f1', 0.8)
    
    this.enemies.forEach(enemy => {
      this.lightingSystem.addLight(enemy.position, 60, '#ff4444', 0.6)
    })

    this.projectiles.forEach(projectile => {
      this.lightingSystem.addLight(projectile.position, 30, '#f59e0b', 1.0)
    })

    // Render entities
    this.player.render(this.ctx)
    
    this.enemies.forEach(enemy => enemy.render(this.ctx))
    this.projectiles.forEach(projectile => projectile.render(this.ctx))

    // Render particles
    this.particleSystem.render(this.ctx)

    // Apply lighting
    this.lightingSystem.applyLighting()

    // Add projectiles from player
    const newProjectiles = this.player.getProjectiles()
    this.projectiles.push(...newProjectiles)
  }
}

export default GameEngine