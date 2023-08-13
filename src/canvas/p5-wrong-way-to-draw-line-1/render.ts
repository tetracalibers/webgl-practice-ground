import p5 from "p5"

const sketch = (p: p5) => {
  const step = 10
  let lastx = -999
  let lasty = -999
  const borderx = 20
  const bordery = 20
  let y = 50

  p.setup = () => {
    p.createCanvas(500, 100)
    p.background(255)
    p.strokeWeight(5)
    p.smooth()

    p.stroke(0, 30)
    p.line(20, 50, 480, 50)

    p.stroke(20, 50, 70)

    for (let x = borderx; x < p.width - borderx; x += step) {
      // yの位置にランダムさを加える
      y = bordery + p.random(p.height - 2 * bordery)

      if (lastx > -999) {
        p.line(x, y, lastx, lasty)
      }

      lastx = x
      lasty = y
    }
  }
}

new p5(sketch)
