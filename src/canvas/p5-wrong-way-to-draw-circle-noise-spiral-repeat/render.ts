import p5 from "p5"

const sketch = (p: p5) => {
  let x: number
  let y: number

  const width = p.windowWidth
  const height = p.windowHeight

  const centx = width / 2
  const centy = height / 2

  p.setup = () => {
    p.createCanvas(width, height)
    p.background(255)
    p.strokeWeight(0.5)
    p.smooth()

    p.stroke(0, 30)
    p.noFill()
    p.ellipse(centx, centy, 200, 200)

    for (let i = 0; i < 100; i++) {
      p.stroke(p.random(20), p.random(50), p.random(70), 80)

      let radius = 10 // 最初は小さく
      let radiusNoise = p.random(10)
      let lastx = -999
      let lasty = -999

      const startangle = p.random(360)
      const endangle = 1440 + p.random(1440)
      const anglestep = 5 + p.random(3)

      for (let degree = startangle; degree <= endangle; degree += anglestep) {
        radius += 0.5
        radiusNoise += 0.05

        const thisRadius = radius + p.noise(radiusNoise) * 200 - 100
        const rad = p.radians(degree)

        x = centx + thisRadius * p.cos(rad)
        y = centy + thisRadius * p.sin(rad)

        if (lastx > -999) {
          p.line(x, y, lastx, lasty)
        }

        lastx = x
        lasty = y
      }
    }
  }
}

new p5(sketch)
