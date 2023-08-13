import p5 from "p5"

const sketch = (p: p5) => {
  const xstep = 10
  let ystep = 10
  let lastx = 20
  let lasty = 50
  let y = 50

  p.setup = () => {
    p.createCanvas(500, 100)
    p.background(255)
    p.strokeWeight(5)
    p.smooth()

    p.stroke(0, 30)
    p.line(20, 50, 480, 50)

    p.stroke(20, 50, 70)

    for (let x = 20; x <= 480; x += xstep) {
      // ランダム値 を y の値に加算または減算することで、より自然な変化を実現
      ystep = p.random(20) - 10 // [-10, 10]
      y += ystep

      p.line(x, y, lastx, lasty)

      lastx = x
      lasty = y
    }
  }
}

new p5(sketch)
