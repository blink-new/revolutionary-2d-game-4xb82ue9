export interface Vector2D {
  x: number
  y: number
}

export interface GameEntity {
  position: Vector2D
  velocity: Vector2D
  radius: number
  color: string
  update(deltaTime: number): void
  render(ctx: CanvasRenderingContext2D): void
}

export interface Particle {
  position: Vector2D
  velocity: Vector2D
  color: string
  life: number
  maxLife: number
  size: number
  alpha: number
}

export interface LightSource {
  position: Vector2D
  radius: number
  color: string
  intensity: number
}