// @ts-check

import { defineConfig } from "astro/config"
import { resolve } from "node:path"
import mdx from "@astrojs/mdx"
import rehypeKatex from "rehype-katex"
import remarkMath from "remark-math"
import svelte from "@astrojs/svelte"
import glslify from "vite-plugin-glslify"
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
      },
      plugins: [
        glslify({
          include: ["**/*.glsl", "**/*.vs", "**/*.fs", "**/*.vert", "**/*.frag"]
        })
      ]
    },
    integrations: [
      // @ts-ignore
      mdx({
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeKatex]
      }),
      svelte()
    ],
    site: "https://tetracalibers.github.io",
    base: "/webgl-practice-ground",
    markdown: {
      syntaxHighlight: "prism",
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex]
    }
  }
)
