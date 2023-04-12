export type UniformMatrix4fv = "uModelViewMatrix" | "uProjectionMatrix" | "uNormalMatrix"
export type Uniform2fv = "uResolution" | "uMouse"
export type Uniform1f = "uTime"
export type Uniform1i = "uTexture"

export type Attribute = "aVertexPosition" | "aVertexNormal" | "aVertexColor" | "aVertexTextureCoords"
export type Uniform = UniformMatrix4fv | Uniform2fv | Uniform1f | Uniform1i

export type AttributeMap = Record<Attribute, number>
export type UniformMap = Record<Uniform, WebGLUniformLocation | null>
