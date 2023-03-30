// @ts-check

import { defineConfig } from "astro/config"
import { resolve } from "node:path"
import mdx from "@astrojs/mdx"
import rehypeKatex from "rehype-katex"
import remarkMath from "remark-math"
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
    integrations: [
      // @ts-ignore
      mdx({
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeKatex]
      })
    ],
    site: "https://tetracalibers.github.io",
    markdown: {
      syntaxHighlight: "prism"
    }
  }
)
