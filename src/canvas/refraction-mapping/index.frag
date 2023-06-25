#version 300 es

precision highp float;

in vec3 vPosition;
in vec3 vNormal;
in vec4 vColor;

out vec4 fragColor;

uniform samplerCube uCubeMap;
uniform vec3 uEyePosition;
uniform float uRefractiveIndex; // 屈折率の比
uniform bool uRefraction;

void main() {
  vec3 ref = uRefraction
    ? refract(normalize(vPosition - uEyePosition), vNormal, uRefractiveIndex)
    : vNormal;
  
  vec4 environment = texture(uCubeMap, ref);
  
  fragColor = vColor * environment;
}