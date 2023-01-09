class App {
	constructor(container) {
		this.layer = new Layer(container)

		addEventListener(`resize`, () => this.createMesh())
		this.createMesh()

		this.loop = new Loop(
			time => this.update(time),
			() => this.display()
		)
	}
	createMesh() {
		this.mesh = new Mesh(this.layer)
	}
	update(correction = 0) {
		this.mesh.updateParticles(correction)
		this.mesh.updateTriangles(correction)
	}
	display() {
		this.mesh.renderTriangles(this.layer.context)
		// this.mesh.renderParticles(this.layer.context);
	}
}

class Mesh {
	constructor({ w, h }) {
		this.maxDist = Math.hypot(w, h)

		this.stepX = this.maxDist * 0.1
		this.stepY = (this.stepX * Math.sqrt(3)) / 2

		this.extraPoints = 3
		this.cols = ((w / this.stepX) | 0) + this.extraPoints
		this.rows = ((h / this.stepY) | 0) + this.extraPoints

		this.extraOffsetX = this.stepX / 4
		this.offsetX = (w - (this.cols - 1) * this.stepX) / 2
		this.offsetY = (h - (this.rows - 1) * this.stepY) / 2

		this.colorTimer = 0
		this.colorSpeed = 30
		this.colorPalet = 160

		this.createParticles()
		this.createTriangles()
	}
	createParticles() {
		this.particles = []
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				const shiftX = i & 1 ? -this.extraOffsetX : this.extraOffsetX

				const x = j * this.stepX + this.offsetX + shiftX
				const y = i * this.stepY + this.offsetY
				const homeX = x
				const homeY = y

				const angle = Math.random() * Math.PI * 2
				const radius =
					(Math.random() * this.extraOffsetX) / 2 + this.extraOffsetX
				const velocity = Math.random() * 2 - 1

				this.particles.push({ x, y, homeX, homeY, angle, radius, velocity })
			}
		}
	}
	createTriangles() {
		this.triangles = []
		for (let y = 0; y < this.rows - 1; y++) {
			const vertices = []
			for (let x = 0; x < this.cols; x++) {
				let a = x + this.cols * (y + 1)
				let b = x + this.cols * y

				if (y & 1) {
					;[a, b] = [b, a]
				}

				vertices.push(this.particles[a], this.particles[b])
			}
			for (let i = 0; i < vertices.length - 2; i++) {
				const a = vertices[i]
				const b = vertices[i + 1]
				const c = vertices[i + 2]

				this.triangles.push({ a, b, c })
			}
		}
	}
	updateParticles(correction = 0) {
		this.particles.forEach(p => {
			p.angle += p.velocity * correction

			p.x = Math.cos(p.angle) * p.radius + p.homeX
			p.y = Math.sin(p.angle) * p.radius + p.homeY
		})
	}
	updateTriangles(correction = 0) {
		this.colorTimer = (this.colorTimer + this.colorSpeed * correction) % 360
	}
	renderParticles(ctx) {
		ctx.fillStyle = `red`
		const radius = 5
		this.particles.forEach(p => {
			ctx.beginPath()
			ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
			ctx.fill()
		})
	}
	renderTriangles(ctx) {
		this.triangles.forEach(t => {
			const { a, b, c } = t

			const posX = (a.x + b.x + c.x) / 3
			const posY = (a.y + b.y + c.y) / 3
			const dist = Math.hypot(posX, posY)

			const hue = (dist / this.maxDist) * this.colorPalet - this.colorTimer

			ctx.strokeStyle = `hsl(${hue}, 70%, 70%)`
			ctx.fillStyle = `hsl(${hue}, 85%, 50%)`

			ctx.beginPath()
			ctx.moveTo(a.x, a.y)
			ctx.lineTo(b.x, b.y)
			ctx.lineTo(c.x, c.y)
			ctx.closePath()

			ctx.fill()
			ctx.stroke()
		})
	}
}

class Layer {
	/**  @param {HTMLElement} container */
	constructor(container) {
		container.appendChild(this.createLayer()) //put Canvas to Container

		addEventListener(`resize`, () => this.fitToContainer(), false)
		this.fitToContainer()
	}
	createLayer() {
		this.canvas = document.createElement(`canvas`) //create new Canvas element
		this.context = this.canvas.getContext(`2d`) //get access to 2d drawing tools
		return this.canvas
	}
	fitToContainer() {
		//fit Canvas size to container
		this.canvas.width = this.canvas.offsetWidth
		this.canvas.height = this.canvas.offsetHeight
	}
	get w() {
		return this.canvas.width
	}
	get h() {
		return this.canvas.height
	}
}

class Loop {
	constructor(update, display) {
		this.update = update
		this.display = display

		this.deltaTime = 0
		this.lastUpdate = 0
		this.maxInterval = 40

		requestAnimationFrame(stampTime => this.animate(stampTime))
	}
	animate(currentTime) {
		requestAnimationFrame(stampTime => this.animate(stampTime))

		this.deltaTime = currentTime - this.lastUpdate

		if (this.deltaTime < this.maxInterval) {
			this.update(this.deltaTime / 1000)
			this.display()
		}

		this.lastUpdate = currentTime
	}
}

onload = () => {
	new App(document.body)
}
