import { z, defineCollection } from "astro:content"

const studyCollection = defineCollection({
  schema: z.object({
    title: z.string()
  })
})

export const collections = {
  study: studyCollection
}
