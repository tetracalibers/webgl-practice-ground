#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

uniform vec2 uResolution;
uniform sampler2D uPrevTexture;
uniform sampler2D uCurrTexture;

out vec4 outColor;

void main() {
  vec2 pos = gl_FragCoord.xy / uResolution.xy;
  
  vec4 prevColor = texture(uPrevTexture, pos);
  vec4 currColor = texture(uCurrTexture, pos);
  outColor = prevColor * 0.1 + currColor * 0.9;
}