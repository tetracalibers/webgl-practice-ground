#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

uniform vec2 uResolution;
uniform vec2 uMouse;
uniform sampler2D uTexture;

in vec2 vTextureCoords;

out vec4 outColor;

void main() {
  vec4 prevColor = texture(uTexture, vTextureCoords);
  outColor = prevColor;
}