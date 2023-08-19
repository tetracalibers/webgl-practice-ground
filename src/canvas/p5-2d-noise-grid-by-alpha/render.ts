import p5 from "p5"

const sketch = (p: p5) => {
  const size = p.min(p.windowWidth, p.windowHeight)

  p.setup = () => {
    p.createCanvas(size, size)
    p.background(255)
    p.smooth()

    let xstart = p.random(10)
    let xnoise = xstart

    let ynoise = p.random(10)

    for (let y = 0; y <= p.height; y++) {
      ynoise += 0.01
      xnoise = xstart
      for (let x = 0; x <= p.width; x++) {
        xnoise += 0.01
        const alpha = p.noise(xnoise, ynoise) * 255
        p.stroke(0, alpha)
        p.line(x, y, x + 1, y + 1)
      }
    }
  }
}

new p5(sketch)
