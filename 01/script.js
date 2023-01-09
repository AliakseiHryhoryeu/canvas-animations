;(function () {
	const canvas = document.createElement('canvas')

	const ctx = canvas.getContext('2d')
	let w = (canvas.width = innerWidth)
	let h = (canvas.height = innerHeight)
	let allParticles = [] // delete
	let triangles = []
	const settings = {
		bgColor: 'rgba(17, 17, 19, 1)',
		particleColor: 'rgba(255, 40, 40, 1)',
		particleRadius: 1,
		particleMaxVelocity: 0.12,
		lineLength: 60,
		triangleLife: 100,
		trianglesCount: 60,
		thianglesParticles: 3,
		thianglesParticleColor: 'rgb(30,60,255)',
	}

	document.querySelector('body').appendChild(canvas)

	window.onresize = function () {
		;(w = canvas.width = innerWidth), (h = canvas.height = innerHeight)
	}

	class Triangle {
		constructor() {
			this.r = settings.lineLength / 2 // initial Radius                            			   Y |
			this.x = Math.random() * (w - this.r - this.r + 1) + this.r // initial Radius center X       |
			this.y = Math.random() * (h - this.r - this.r + 1) + this.r // initial Radius center Y       |_________ X
			// Math.random() * (max - min + 1) + min - made in order to point generation did not go beyond the visible area of the screen
			// max = width(or height) screen - radius
			// min = radius
			this.particles = []
			this.life = Math.random() * settings.triangleLife * 60
		}
		createParticles() {
			for (let i = 0; i < settings.thianglesParticles; i++) {
				const particle = new Particle({
					x: Math.cos(Math.random() * Math.PI * 2) * this.r + this.x,
					y: Math.sin(Math.random() * Math.PI * 2) * this.r + this.y,
					// (Math.random() * Math.PI * 2) - random angle
					// Math.cos(angle) * this.r - generate in random radius
					// + this.x (+ this.y) - initial offset
				})
				this.particles.push(particle)
			}
		}
		reCalculateLife() {
			if (this.life < 1) {
				// triangles = triangles.filter(
				// 	item => (item === item.x) !== this.x && item.y != this.y
				// )
				// triangles.push
				this.r = settings.lineLength / 2 // initial Radius                            			   Y |
				this.x = Math.random() * (w - this.r - this.r + 1) + this.r // initial Radius center X       |
				this.y = Math.random() * (h - this.r - this.r + 1) + this.r // initial Radius center Y       |_________ X

				this.particles = []

				this.life = Math.random() * settings.triangleLife * 60
				this.createParticles()
			}
			this.life--
		}

		reDraw() {
			// Checking Position on the screen and control borders of the screen
			for (let i = 0; i < this.particles.length; i++) {
				this.particles[i].position()
			}
			// Checking Position on the screen and control distances between particles
			// this algorithm not ideal, but he compensated by slow animation
			for (let i = 0; i < this.particles.length; i++) {
				let changed = false
				const x1 = this.particles[i].x
				const y1 = this.particles[i].y

				for (let j = 0; j < this.particles.length; j++) {
					if (i === j) {
						continue
					}
					const lenghtX = Math.abs(x1 - this.particles[j].x)
					const lenghtY = Math.abs(y1 - this.particles[j].y)
					if (lenghtX + this.particles[i].velocityX >= settings.lineLength) {
						this.particles[i].changeVilocityX()
						this.particles[j].changeVilocityX()
						changed = true
						break
					}
					if (lenghtY + this.particles[i].velocityY >= settings.lineLength) {
						this.particles[i].changeVilocityY()
						this.particles[j].changeVilocityY()
						changed = true
						break
					}
				}
				if (changed) {
					break
				}
			} // Draw Particles
			for (let i = 0; i < this.particles.length; i++) {
				ctx.beginPath()
				ctx.arc(
					this.particles[i].x,
					this.particles[i].y,
					settings.particleRadius,
					0,
					Math.PI * 2
				)
				ctx.closePath()
				ctx.fillStyle = settings.particleColor
				ctx.fill()
			}

			// Draw Lines
			for (let i = 0; i < this.particles.length; i++) {
				for (let j = 0; j < this.particles.length; j++) {
					const x1 = this.particles[i].x
					const y1 = this.particles[i].y
					const x2 = this.particles[j].x
					const y2 = this.particles[j].y

					const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
					const opacity = 1 - length / settings.lineLength + 0.4
					ctx.lineWidth = '0.5'
					// ctx.strokeStyle = 'rgba(255, 40, 40, ' + opacity + ')'
					ctx.strokeStyle = settings.particleColor
					ctx.beginPath()
					ctx.moveTo(x1, y1)
					ctx.lineTo(x2, y2)
					ctx.closePath()
					ctx.stroke()
				}
			}
		}
	}
	class Particle {
		constructor(props) {
			this.x = props.x
			this.y = props.y
			this.velocityX =
				Math.random() * (settings.particleMaxVelocity * 2) -
				settings.particleMaxVelocity
			this.velocityY =
				Math.random() * (settings.particleMaxVelocity * 2) -
				settings.particleMaxVelocity
		}
		position() {
			// Check X и Y
			// x + velocity > width screen
			// or
			// x + velocity < width screen
			// if something === true -> change velocity direction
			if (this.x + this.velocityX > w || this.x + this.velocityX < 0) {
				this.velocityX *= -1
			}
			if (this.y + this.velocityY > h || this.y + this.velocityY < 0) {
				this.velocityY *= -1
			}
			// change x and y taking into account velocity
			this.x += this.velocityX
			this.y += this.velocityY
		}
		changeVilocityX() {
			this.velocityX *= -1
			this.x += this.velocityX
		}
		changeVilocityY() {
			this.velocityY *= -1
			this.y += this.velocityY
		}
	}

	// particles[i].reCalculateLife()
	// particles[i].position() // +-
	// particles[i].reDraw() // +

	function reDrawBackground() {
		ctx.fillStyle = settings.bgColor
		ctx.fillRect(0, 0, w, h)
	}

	function reDrawTriangles() {
		for (var i in triangles) {
			// triangles[i].reCalculateLife()
			// const test = triangles[i]
			// triangles[i].position()
			triangles[i].reDraw()
			triangles[i].reCalculateLife()
		}
	}
	function loop() {
		reDrawBackground()
		// reDrawParticles()
		reDrawTriangles()
		requestAnimationFrame(loop)
	}
	function init() {
		for (let i = 0; i < settings.trianglesCount; i++) {
			const triangle = new Triangle()
			triangle.createParticles()
			triangles.push(triangle)
		}
		// loop()
		loop()
	}

	init()
})()
