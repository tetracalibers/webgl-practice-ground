#version 300 es

precision highp float;

/**

すべてのフラグメントを破棄するno-op
(WebGL2では頂点のみのプログラムが許可されないため)

**/

out vec4 fragColor;

void main() {
  discard;
}