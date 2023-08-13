import p5 from "p5"

const sketch = (p: p5) => {
  let radius = 10 // 最初は小さく
  const centx = 250
  const centy = 150
  let x: number
  let y: number
  let lastx = -999
  let lasty = -999

  p.setup = () => {
    p.createCanvas(500, 300)
    p.background(255)
    p.strokeWeight(5)
    p.smooth()

    p.stroke(0, 30)
    p.noFill()
    p.ellipse(centx, centy, 200, 200)

    p.stroke(20, 50, 70)

    // 1440 = 360 * 4 なので、4回転する
    for (let degree = 0; degree <= 1440; degree += 5) {
      radius += 0.5

      const rad = p.radians(degree)

      x = centx + radius * p.cos(rad)
      y = centy + radius * p.sin(rad)

      if (lastx > -999) {
        p.line(x, y, lastx, lasty)
      }

      lastx = x
      lasty = y
    }
  }
}

new p5(sketch)
