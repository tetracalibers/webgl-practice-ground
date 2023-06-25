// @ts-check

import sharp from "sharp"
import glob from "glob-promise"
import path from "node:path"
import fs from "node:fs"

/**
 * @param {import("sharp").Sharp} image
 */
async function splitSkyboxImage(image) {
  // アルファチャネルを持つかチェック
  let { channels, width, height } = await image.metadata()
  const hasOpacity = channels === 4

  if (width === undefined || height === undefined) {
    throw new Error("Failed to get image metadata")
  }

  if (hasOpacity) {
    // 透明な部分を除去
    image.trim()
    // トリミング後のサイズを取得
    const { info } = await image.png().toBuffer({ resolveWithObject: true })
    width = info.width
    height = info.height
  }

  if (width % 4 !== 0 || height % 3 !== 0) {
    // widthが4の倍数、heightが3の倍数になるようにリサイズ
    image.resize(Math.floor(width / 4) * 4, Math.floor(height / 3) * 3)
    // リサイズ後のサイズを取得
    const { info: info2 } = await image.png().toBuffer({ resolveWithObject: true })
    width = info2.width
    height = info2.height
  }

  if (width === undefined || height === undefined) {
    throw new Error("Failed to get image metadata")
  }

  const faceWidth = width / 4
  const faceHeight = height / 3

  const faces = await Promise.all([
    // front
    image.clone().extract({ left: faceWidth, top: faceHeight, width: faceWidth, height: faceHeight }),
    // back
    image.clone().extract({ left: 3 * faceWidth, top: faceHeight, width: faceWidth, height: faceHeight }),
    // left
    image.clone().extract({ left: 0, top: faceHeight, width: faceWidth, height: faceHeight }),
    // right
    image.clone().extract({ left: 2 * faceWidth, top: faceHeight, width: faceWidth, height: faceHeight }),
    // top
    image.clone().extract({ left: faceWidth, top: 0, width: faceWidth, height: faceHeight }),
    // bottom
    image.clone().extract({ left: faceWidth, top: 2 * faceHeight, width: faceWidth, height: faceHeight })
  ])

  return {
    front: faces[0],
    back: faces[1],
    left: faces[2],
    right: faces[3],
    top: faces[4],
    bottom: faces[5]
  }
}

/**
 * @param {string} src
 */
const basename = (src) => path.basename(src, path.extname(src))

/**
 * @param {string} src
 */
const dirname = (src) => path.dirname(src).split(path.sep).pop()

;(async () => {
  const images = await glob("./src/assets/cube-map/*.{png,jpg,jpeg,svg}")
  const exists = (await glob("./src/assets/cube-map/**"))
    .map(dirname)
    .filter((dir) => dir && !["assets", "cube-map"].includes(dir))

  const newImages = images.filter((image) => !exists.includes(basename(image)))

  for (const image of newImages) {
    const promises = []

    const name = basename(image)

    fs.mkdirSync(`./src/assets/cube-map/${name}`, { recursive: true })

    const faces = await splitSkyboxImage(sharp(image))

    for (const face of Object.keys(faces)) {
      promises.push(faces[face].png().toFile(`./src/assets/cube-map/${name}/${face}.png`))
    }

    await Promise.all(promises)
  }
})()
