#version 300 es

precision highp float;

uniform sampler2D uTexture0;

in vec4 vColor;
in vec2 vTextureCoords;

out vec4 fragColor;

void main() {
  vec4 smpColor = texture(uTexture0, vTextureCoords);
  
  fragColor = vColor * smpColor;
}