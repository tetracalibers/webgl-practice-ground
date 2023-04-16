export type UniformMatrix4fv = "uModelViewMatrix" | "uProjectionMatrix" | "uNormalMatrix" | "uInvModelMatrix"
export type Uniform2fv = "uResolution" | "uMouse"
export type Uniform3fv = "uLightDirection" | "uEyeDirection"
export type Uniform4fv = "uAmbientColor"
export type Uniform1f = "uTime"
export type Uniform1i = "uTexture" | `uTexture${number}` | "uIsUseLight"

export type Attribute = "aVertexPosition" | "aVertexNormal" | "aVertexColor" | "aVertexTextureCoords"
export type Uniform = UniformMatrix4fv | Uniform2fv | Uniform1f | Uniform1i | Uniform3fv | Uniform4fv

export type AttributeMap = Record<Attribute, number>
export type UniformMap = Record<Uniform, WebGLUniformLocation | null>
