#version 300 es

precision highp float;

uniform sampler2D uTexture;

in vec2 vTextureCoords;

out vec4 fragColor;

void main() {
  fragColor = texture(uTexture, vTextureCoords);
}