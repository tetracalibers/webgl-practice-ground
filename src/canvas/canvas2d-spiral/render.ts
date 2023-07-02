export const onload = () => {
  const canvas = <HTMLCanvasElement>document.getElementById("gl-canvas")
  const context = canvas.getContext("2d")!

  let radius = 0
  let angle = 0

  context.lineWidth = 10
  context.strokeStyle = "#0096FF"
  context.beginPath()
  // 描画カーソルをキャンバスの中心に置く
  context.moveTo(canvas.width / 2, canvas.height / 2)

  // 中心の周りの半径と角度を繰り返し増加させて、前の点から現在の点まで非常に短い線を描く
  for (let n = 0; n < 150; n++) {
    radius += 0.75
    angle += (Math.PI * 2) / 50
    const x = canvas.width / 2 + radius * Math.cos(angle)
    const y = canvas.height / 2 + radius * Math.sin(angle)
    context.lineTo(x, y)
  }

  context.stroke()
}
