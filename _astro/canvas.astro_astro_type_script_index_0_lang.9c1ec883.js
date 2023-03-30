import{S as f,P as m}from"./program.2ef84f69.js";import{U as v}from"./uniform-reflect.63d9f660.js";import{T as x}from"./timer.1ee66154.js";import{C as g}from"./clock.75804a61.js";const h=`#version 300 es

// @see https://gist.github.com/strangerintheq/27b8fc4e53432d8b9284364713ce8608
void main() {
  float x = float((gl_VertexID & 1) << 2);
  float y = float((gl_VertexID & 2) << 1);
  gl_Position = vec4(x - 1.0, y - 1.0, 0, 1);
}`,p=`#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

uniform vec2 uResolution;
uniform float uTime;

out vec4 outColor;

// 符号なし整数の最大値
const uint UINT_MAX = 0xffffffffu;

// 算術積に使う大きな桁数の定数
uvec3 k = uvec3(0x456789abu, 0x6789ab45u, 0x89ab4567u);
// シフト数
uvec3 u = uvec3(1, 2, 3);

// 符号なし整数の2d => 2dハッシュ関数
uvec2 uhash22(uvec2 n){
  n ^= (n.yx << u.xy);
  n ^= (n.yx >> u.xy);
  n *= k.xy;
  n ^= (n.yx << u.xy);
  return n * k.xy;
}

// 浮動小数点数の2d => 1dハッシュ関数
float hash21(vec2 b) {
  // ビット列を符号なし整数に変換
  uvec2 n = floatBitsToUint(b);
  // 値の正規化
  return float(uhash22(n).x) / float(UINT_MAX);
}

void main() {
  vec2 pos = gl_FragCoord.xy;
  
  // フラグメント座標を時間変動させる（1秒間に60カウント）
  pos += floor(60.0 * uTime);
  
  outColor.rgb = vec3(hash21(pos));
  outColor.a = 1.0;
}`;window.onload=()=>{const o=new f("gl-canvas"),s=o.canvas,n=o.gl;if(!s||!n)return;let e,t,r;const c=()=>{o.autoResize(()=>o.fitScreen()),n.clearColor(0,0,0,1),n.clearDepth(1);const a=new m(n,h,p),u=[],l=["uResolution","uTime"];a.load(u,l),e=new v(n,a),r=new g,t=new x,t.start()},i=()=>{n.viewport(0,0,n.canvas.width,n.canvas.height),n.clear(n.COLOR_BUFFER_BIT|n.DEPTH_BUFFER_BIT),e.time(t.elapsed),e.resolution(),n.drawArrays(n.TRIANGLE_FAN,0,3)};(()=>{c(),r.on("tick",i)})()};
