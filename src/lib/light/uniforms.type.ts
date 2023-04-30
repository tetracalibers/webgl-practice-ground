export type MaterialTerms = "uMaterialDiffuse" | "uMaterialSpecular" | "uMaterialAmbient"
export type LightTerms = "uLightAmbient" | "uLightSpecular" | "uLightDiffuse"
export type VectorTerms = "uLightPosition" | "uLightDirection"
export type FloatTerms = "uShininess"
export type Terms = MaterialTerms | LightTerms | VectorTerms | FloatTerms
export type LightUniforms = LightTerms | VectorTerms | FloatTerms
