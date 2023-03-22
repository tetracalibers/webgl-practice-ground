import fs from "fs-extra"

const newTitle = process.argv[2]
const copyFrom = process.argv[3]

if (copyFrom) {
  await fs.copy("src/canvas/" + copyFrom, "src/canvas/" + newTitle)
} else {
  const dir = "src/canvas/" + newTitle
  await fs.mkdir(dir)
  await fs.writeFile(dir + "/canvas.astro", "")
  await fs.writeFile(dir + "/index.frag", "")
  await fs.writeFile(dir + "/index.vert", "")
}

await fs.writeFile(
  "src/content/study/" + newTitle + ".mdx",
  `
---
title: ""
---

import Canvas from "@/canvas/${newTitle}/canvas.astro"

<Canvas />
`.trimStart()
)
