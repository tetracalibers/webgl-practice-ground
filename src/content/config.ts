import { z, defineCollection } from "astro:content"

export const noteCategories = ["math", "image", "CG"] as const

export const noteCategoryDetail: Record<(typeof noteCategories)[number], { title: string }> = {
  math: {
    title: "数学"
  },
  CG: {
    title: "グラフィックス"
  },
  image: {
    title: "画像処理"
  }
}

const zNote = z.object({
  title: z.string(),
  category: z.enum(noteCategories)
})

export const imageProcessingCategories = [
  "edge-detection",
  "composite",
  "smoothing",
  "color",
  "sharpen",
  "NPR",
  "deformation"
] as const

export const imageProcessingCategoryDetail: Record<(typeof imageProcessingCategories)[number], { title: string }> = {
  composite: {
    title: "合成"
  },
  smoothing: {
    title: "平滑化"
  },
  sharpen: {
    title: "鮮鋭化"
  },
  "edge-detection": {
    title: "エッジ検出"
  },
  color: {
    title: "色の操作"
  },
  deformation: {
    title: "変形"
  },
  NPR: {
    title: "非写実的描画"
  }
}

const zImageProcessingStudy = z.object({
  title: z.string(),
  category: z.literal("image-processing"),
  subcategory: z.enum(imageProcessingCategories)
})

export const canvasCategories = ["line", "physics"] as const

export const canvasCategoryDetail: Record<(typeof canvasCategories)[number], { title: string }> = {
  line: {
    title: "Line"
  },
  physics: {
    title: "物理"
  }
}

const zCanvasStudy = z.object({
  title: z.string(),
  category: z.literal("canvas2d"),
  subcategory: z.enum(canvasCategories)
})

export const webglCategories = [
  "basic",
  "lighting",
  "blending",
  "framebuffer",
  "texture",
  "transform",
  "camera",
  "post-processing",
  "stencil",
  "instancing",
  "GPGPU",
  "MRT",
  "model"
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
  model: {
    title: "Model"
  },
  texture: {
    title: "Texture Mapping"
  },
  stencil: {
    title: "Stencil"
  },
  framebuffer: {
    title: "Framebuffer"
  },
  "post-processing": {
    title: "Post Processing"
  },
  MRT: {
    title: "Multiple Render Targets"
  },
  instancing: {
    title: "Instancing"
  },
  GPGPU: {
    title: "GPGPU"
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
  schema: z.discriminatedUnion("category", [zWebglStudy, zGlslStudy, zImageProcessingStudy, zCanvasStudy])
})

export const collections = {
  study: studyCollection,
  note: zNote
}
