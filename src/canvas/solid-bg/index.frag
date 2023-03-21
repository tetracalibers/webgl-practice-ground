#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

out vec4 outColor;

void main() {
  outColor = vec4(1.0, 0.0, 0.5, 1.0);
}