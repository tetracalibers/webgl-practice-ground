import { z, defineCollection } from "astro:content"

export const webglCategories = ["shape"] as const

const zWebglStudy = z.object({
  title: z.string(),
  category: z.literal("webgl"),
  subcategory: z.enum(webglCategories)
})

export const glslCategories = [
  "color",
  "basic",
  "math",
  "interpolation",
  "coordinate-system",
  "plot",
  "shape",
  "fractal",
  "physics",
  "random",
  "pattern",
  "motion",
  "image-processing",
  "3d",
  "application",
  "simulation"
] as const

export const glslCategoryDetail: Record<(typeof glslCategories)[number], { title: string }> = {
  basic: {
    title: "Basic"
  },
  math: {
    title: "Mathematics"
  },
  interpolation: {
    title: "Interpolation"
  },
  plot: {
    title: "Graph"
  },
  "coordinate-system": {
    title: "Coordinate System"
  },
  color: {
    title: "Color"
  },
  random: {
    title: "Random"
  },
  shape: {
    title: "Shape"
  },
  pattern: {
    title: "Pattern"
  },
  "3d": {
    title: "3D"
  },
  application: {
    title: "アプリケーション"
  },
  fractal: {
    title: "フラクタル"
  },
  "image-processing": {
    title: "画像処理"
  },
  motion: {
    title: "動き"
  },
  physics: {
    title: "物理"
  },
  simulation: {
    title: "シミュレーションとゲーム"
  }
}

const zGlslStudy = z.object({
  title: z.string(),
  category: z.literal("glsl"),
  subcategory: z.enum(glslCategories)
})

const studyCollection = defineCollection({
  schema: z.discriminatedUnion("category", [zWebglStudy, zGlslStudy])
})

export const collections = {
  study: studyCollection
}
