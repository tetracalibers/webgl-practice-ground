import{S as a,P as l}from"./program.2ef84f69.js";import{U as v}from"./uniform-reflect.63d9f660.js";const f=`#version 300 es

// @see https://gist.github.com/strangerintheq/27b8fc4e53432d8b9284364713ce8608
void main() {
  float x = float((gl_VertexID & 1) << 2);
  float y = float((gl_VertexID & 2) << 1);
  gl_Position = vec4(x - 1.0, y - 1.0, 0, 1);
}`,u=`#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

uniform vec2 uResolution;

out vec4 outColor;

void main() {
  vec2 pos = gl_FragCoord.xy / uResolution.xy;
  vec3 RED = vec3(1.0, 0.0, 0.0);
  vec3 GREEN = vec3(0.0, 1.0, 0.0);
  vec3 BLUE = vec3(0.0, 0.0, 1.0);
  // 色配列
  vec3[3] colors3 = vec3[](RED, BLUE, GREEN);
  // x座標範囲を[0, 2]区間にスケール
  pos.x *= 2.0;
  // 整数型に変換することで、0, 1, 2のいずれかの値になる
  int idx = int(pos.x);
  // 配列から連続する2つのベクトルを取り出し、線形補間
  // - fractは小数部分を取得する関数
  vec3 xlerpColor = mix(colors3[idx], colors3[idx + 1], fract(pos.x));
  
  outColor = vec4(xlerpColor, 1.0);
}`;window.onload=()=>{const o=new a("gl-canvas"),t=o.canvas,n=o.gl;if(!t||!n)return;const c=()=>{o.autoResize(()=>o.fitScreen()),n.clearColor(0,0,0,1),n.clearDepth(1);const e=new l(n,f,u),s=[],i=["uResolution"];e.load(s,i),new v(n,e).resolution()},r=()=>{n.viewport(0,0,n.canvas.width,n.canvas.height),n.clear(n.COLOR_BUFFER_BIT|n.DEPTH_BUFFER_BIT),n.drawArrays(n.TRIANGLE_FAN,0,3)};(()=>{c(),r()})()};
