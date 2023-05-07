#version 300 es

in vec3 aVertexPosition;
in vec3 aVertexNormal;
in vec4 aVertexColor;
in vec2 aVertexTextureCoords;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;
uniform vec3 uLightDirection;
uniform float uThickness;
uniform bool uUseLight;
uniform bool uDrawOutline;

out vec4 vVertexColor;
out vec2 vTextureCoords;

void main() {
  vec4 color = aVertexColor;
  vec3 N = aVertexNormal;
  
  if (uUseLight) {
    vec3 L = normalize(vec3(uModelViewMatrix * vec4(uLightDirection, 0.0)));
    float lambertTerm = clamp(dot(N, -L), 0.1, 1.0);
    
    color *= vec4(vec3(lambertTerm), 1.0);
  }
  
  vVertexColor = color;
  vTextureCoords = aVertexTextureCoords;
  
  vec3 position = uDrawOutline ? aVertexPosition + N * uThickness : aVertexPosition;
  
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(position, 1.0);
}