export const onload = () => {
  const canvas = <HTMLCanvasElement>document.getElementById("gl-canvas")
  const context = canvas.getContext("2d")!

  const startX = 85
  const startY = 70
  const zigzagSpacing = 60

  context.lineWidth = 10
  context.strokeStyle = "#0096FF"
  context.beginPath()
  context.moveTo(startX, startY)

  for (let n = 0; n < 7; n++) {
    let x = startX + (n + 1) * zigzagSpacing
    let y

    if (n % 2 === 0) {
      // 偶数の反復では右下に移動する対角線を描く
      y = startY + 100
    } else {
      // 奇数の反復では右上に移動する対角線を描く
      y = startY
    }
    context.lineTo(x, y)
  }

  context.stroke()
}
