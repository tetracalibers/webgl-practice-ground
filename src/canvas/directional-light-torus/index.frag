#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

in vec4 vColor;

out vec4 fragColor;

void main() {
  fragColor = vColor;
}