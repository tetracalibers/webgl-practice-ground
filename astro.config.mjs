// @ts-check

import { defineConfig } from "astro/config"
import { resolve } from "node:path"
import mdx from "@astrojs/mdx"
const __dirname = new URL(".", import.meta.url).pathname

// https://astro.build/config
export default defineConfig(
  /** @type {import('astro').AstroUserConfig} */
  {
    vite: {
      resolve: {
        alias: {
          "@": resolve(__dirname, "src")
        }
      }
    },
    integrations: [mdx()]
  }
)
