// @ts-check

import sharp from "sharp"
import glob from "glob-promise"
import path from "node:path"
import fs from "node:fs"

/**
 * @param {string} src
 */
const basename = (src) => path.basename(src, path.extname(src))

;(async () => {
  const images = await glob("./src/assets/original/*.{png,jpg,jpeg}")
  const exists = (await glob("./src/assets/542x542/*.{png,jpg,jpeg}")).map((src) => basename(src))

  const newImages = images.filter((image) => !exists.includes(basename(image)))
  const sizes = [542]

  for (const image of newImages) {
    const sharpStream = sharp({ failOn: "none" })
    const promises = []

    const name = basename(image)

    for (const size of sizes) {
      promises.push(sharpStream.clone().resize(size, size).png().toFile(`./src/assets/${size}x${size}/${name}.png`))
    }

    fs.createReadStream(image).pipe(sharpStream)

    await Promise.all(promises)
  }
})()
