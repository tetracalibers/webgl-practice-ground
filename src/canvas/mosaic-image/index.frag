#version 300 es

precision highp float;

uniform sampler2D uTexture0;

in vec2 vTextureCoords;

out vec4 fragColor;

void main() {
  vec2 texCoord = vec2(vTextureCoords.x, 1.0 - vTextureCoords.y);
  fragColor = texture(uTexture0, texCoord);
}