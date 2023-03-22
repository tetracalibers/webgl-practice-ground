export type Attribute = "aVertexPosition" | "aVertexNormal" | "aVertexColor" | "aVertexTextureCoords"
export type Uniform = "uModelViewMatrix" | "uProjectionMatrix" | "uNormalMatrix" | "uResolution"

export type AttributeMap = Record<Attribute, number>
export type UniformMap = Record<Uniform, WebGLUniformLocation | null>
