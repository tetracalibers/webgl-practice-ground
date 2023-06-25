#version 300 es

precision highp float;

in vec3 vPosition;
in vec3 vNormal;
in vec4 vColor;

out vec4 fragColor;

uniform samplerCube uCubeMap;
uniform vec3 uEyePosition;
uniform bool uReflection;

void main() {
  vec3 ref = uReflection
    ? reflect(vPosition - uEyePosition, vNormal)
    : vNormal;
  
  vec4 environment = texture(uCubeMap, ref);
  
  fragColor = vColor * environment;
}