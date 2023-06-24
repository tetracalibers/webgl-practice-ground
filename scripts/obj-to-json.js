import { objsonConvert } from "./lib/objson.js"
import glob from "glob-promise"
import path from "node:path"
import fs from "node:fs"

/**
 * @param {string} src
 */
const basename = (src) => path.basename(src, path.extname(src))

;(async () => {
  const objs = await glob("./src/model/obj/*.obj")
  const jsons = await glob("./src/model/json/*.json")

  const exsits = jsons.map((src) => basename(src))
  const needConvert = objs.filter((obj) => !exsits.includes(basename(obj)))

  for (const obj of needConvert) {
    const name = basename(obj)
    const source = fs.readFileSync(obj, "utf-8")
    const dest = objsonConvert(source)
    fs.writeFileSync(`./src/model/json/${name}.json`, JSON.stringify(dest, null, 2))
  }
})()
