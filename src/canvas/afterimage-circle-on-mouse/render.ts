import { Space } from "@/lib/canvas/index"
import { Afterimage } from "@/lib/feature/afterimage"
import { Clock } from "@/lib/event/clock"

import vertexSource from "./index.vert?raw"
import fragmentSource from "./index.frag?raw"

export const onload = () => {
  const space = new Space("gl-canvas")
  const canvas = space.canvas
  const gl = space.gl
  if (!canvas || !gl) return

  let clock: Clock
  let scene: Afterimage

  const onResize = () => {
    space.fitScreen()
    scene.resize()
    render()
  }

  const configure = () => {
    space.fitScreen()

    gl.clearColor(1.0, 1.0, 1.0, 1.0)
    gl.clearDepth(1.0)

    clock = new Clock()
    scene = new Afterimage(gl, canvas, vertexSource, fragmentSource)

    space.onResize = onResize
  }

  const render = () => {
    scene.draw()
  }

  const init = () => {
    configure()
    clock.on("tick", render)
  }

  init()
}
