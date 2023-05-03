import { z, defineCollection } from "astro:content"

export const imageProcessingCategories = ["edge-detection", "composite"] as const

export const imageProcessingCategoryDetail: Record<(typeof imageProcessingCategories)[number], { title: string }> = {
  composite: {
    title: "合成"
  },
  "edge-detection": {
    title: "エッジ検出"
  }
}

const zImageProcessingStudy = z.object({
  title: z.string(),
  category: z.literal("image-processing"),
  subcategory: z.enum(imageProcessingCategories)
})

export const webglCategories = [
  "basic",
  "lighting",
  "blending",
  "framebuffer",
  "texture",
  "transform",
  "camera",
  "post-processing"
] as const

export const webglCategoryDetail: Record<(typeof webglCategories)[number], { title: string }> = {
  basic: {
    title: "Basic"
  },
  lighting: {
    title: "Lighting"
  },
  blending: {
    title: "Blending"
  },
  transform: {
    title: "Transform"
  },
  camera: {
    title: "Camera"
  },
  texture: {
    title: "Texture Mapping"
  },
  framebuffer: {
    title: "Framebuffer"
  },
  "post-processing": {
    title: "Post Processing"
  }
}

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
  "simulation",
  "transform"
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
  transform: {
    title: "Transform"
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
  schema: z.discriminatedUnion("category", [zWebglStudy, zGlslStudy, zImageProcessingStudy])
})

export const collections = {
  study: studyCollection
}
