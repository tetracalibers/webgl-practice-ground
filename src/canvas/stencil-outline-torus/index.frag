#version 300 es

precision highp float;

in vec4 vVertexColor;
in vec2 vTextureCoords;

uniform sampler2D uTexture0;
uniform bool uUseTexture;

out vec4 fragColor;

void main() {
  vec4 smpColor = uUseTexture ? texture(uTexture0, vTextureCoords) : vec4(1.0);
  
  fragColor = vVertexColor * smpColor;
}