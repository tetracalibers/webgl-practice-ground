import{S as u,P as m}from"./program.2ef84f69.js";import{U as g}from"./uniform-reflect.63d9f660.js";import{T as h}from"./timer.1ee66154.js";import{C as v}from"./clock.75804a61.js";const p=`#version 300 es

// @see https://gist.github.com/strangerintheq/27b8fc4e53432d8b9284364713ce8608
void main() {
  float x = float((gl_VertexID & 1) << 2);
  float y = float((gl_VertexID & 2) << 1);
  gl_Position = vec4(x - 1.0, y - 1.0, 0, 1);
}`,d=`#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

uniform vec2 uResolution;
uniform float uTime;

out vec4 outColor;

// 算術積に使う大きな桁数の定数
uint k = 0x456789abu;
// 符号なし整数の最大値
const uint UINT_MAX = 0xffffffffu;

// 符号なし整数の1dハッシュ関数
uint uhash11(uint n) {
  n ^= (n << 1);
  n ^= (n >> 1);
  n *= k;
  n ^= (n << 1);
  return n * k;
}

// 浮動小数点数の1dハッシュ関数
float hash11(float b) {
  // ビット列を符号なし整数に変換
  uint n = floatBitsToUint(b);
  // 値の正規化
  return float(uhash11(n)) / float(UINT_MAX);
}

void main() {
  vec2 pos = gl_FragCoord.xy;
  
  // フラグメント座標を時間変動させる（1秒間に60カウント）
  pos += floor(60.0 * uTime);
  
  outColor = vec4(vec3(hash11(pos.x)), 1.0);
}`;window.onload=()=>{const o=new u("gl-canvas"),i=o.canvas,n=o.gl;if(!i||!n)return;let t,e,r;const s=()=>{o.autoResize(()=>o.fitScreen()),n.clearColor(0,0,0,1),n.clearDepth(1);const a=new m(n,p,d),l=[],f=["uResolution","uTime"];a.load(l,f),t=new g(n,a),r=new v,e=new h,e.start()},c=()=>{n.viewport(0,0,n.canvas.width,n.canvas.height),n.clear(n.COLOR_BUFFER_BIT|n.DEPTH_BUFFER_BIT),t.time(e.elapsed),t.resolution(),n.drawArrays(n.TRIANGLE_FAN,0,3)};(()=>{s(),r.on("tick",c)})()};
