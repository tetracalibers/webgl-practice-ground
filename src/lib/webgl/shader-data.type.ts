export type UniformMatrix4fv = "uModelViewMatrix" | "uProjectionMatrix" | "uNormalMatrix"
export type Uniform2fv = "uResolution"

export type Attribute = "aVertexPosition" | "aVertexNormal" | "aVertexColor" | "aVertexTextureCoords"
export type Uniform = UniformMatrix4fv | Uniform2fv

export type AttributeMap = Record<Attribute, number>
export type UniformMap = Record<Uniform, WebGLUniformLocation | null>
