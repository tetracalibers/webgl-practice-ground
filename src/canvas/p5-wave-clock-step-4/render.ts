import p5 from "p5"

const sketch = (p: p5) => {
  let strokeColor = 254
  let strokeChange = -1

  const initRadius = p.min(p.windowWidth, p.windowHeight)
  let radiusNoise: number
  let radius: number

  let angleNoise: number
  let angle = -p.PI / 2

  const centerX = p.windowWidth / 2
  const centerY = p.windowHeight / 2

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    p.frameRate(30)
    p.background(255)
    p.smooth()
    p.noFill()

    radiusNoise = p.random(10)
    angleNoise = p.random(10)
  }

  p.draw = () => {
    // 回転の角度にノイズ変動を加えて、線の密度を変える
    angleNoise += 0.005
    angle += p.noise(angleNoise) * 6 - 3
    // 反転
    if (angle > 360) angle -= 360
    if (angle < 0) angle += 360

    // 2点を結ぶ線の長さが、回転するにつれてノイズ値によって変化するように
    radiusNoise += 0.005
    radius = p.noise(radiusNoise) * initRadius + 1

    // 円周上の点を計算
    const rad = p.radians(angle)
    const x1 = centerX + radius * p.cos(rad)
    const y1 = centerY + radius * p.sin(rad)

    // 反対側の点を計算（ラジアンで180度回転）
    const opprad = rad + p.PI
    const x2 = centerX + radius * p.cos(opprad)
    const y2 = centerY + radius * p.sin(opprad)

    // 255から始めて、毎フレームごとに1ずつ0に達するまで減少させていき、また逆に255に戻っていく
    strokeColor += strokeChange
    if (strokeColor > 254) strokeChange = -1
    if (strokeColor < 0) strokeChange = 1

    p.stroke(strokeColor, 60)
    p.strokeWeight(1)
    // 円周上のそれぞれの点から反対側の点に線を引く
    p.line(x1, y1, x2, y2)
  }
}

new p5(sketch)
