import p5 from "p5"

const getDrawPointFn = (p: p5) => (x: number, y: number, noiseFactor: number) => {
  // 前の描画位置を保存
  p.push()

  // (0, 0)のところではなく、今描いているポイントで回転させる
  p.translate(x, y)
  p.rotate(noiseFactor * p.radians(360))

  // 線の描画
  p.stroke(0, 150)
  p.line(0, 0, 20, 0)

  // 前の描画位置を再び取り出す
  p.pop()
}

const sketch = (p: p5) => {
  const size = p.min(p.windowWidth, p.windowHeight)
  const drawPoint = getDrawPointFn(p)

  p.setup = () => {
    p.createCanvas(size, size)
    p.background(255)
    p.smooth()

    let xstart = p.random(10)
    let xnoise = xstart
    let ynoise = p.random(10)

    for (let y = 0; y <= p.height; y += 5) {
      ynoise += 0.1
      xnoise = xstart
      for (let x = 0; x <= p.width; x += 5) {
        xnoise += 0.1
        drawPoint(x, y, p.noise(xnoise, ynoise))
      }
    }
  }
}

new p5(sketch)
