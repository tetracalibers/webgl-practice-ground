import{S as i,P as l}from"./program.2ef84f69.js";import{U as v}from"./uniform-reflect.63d9f660.js";const u=`#version 300 es

// @see https://gist.github.com/strangerintheq/27b8fc4e53432d8b9284364713ce8608
void main() {
  float x = float((gl_VertexID & 1) << 2);
  float y = float((gl_VertexID & 2) << 1);
  gl_Position = vec4(x - 1.0, y - 1.0, 0, 1);
}`,f=`#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

uniform vec2 uResolution;

out vec4 outColor;

void main() {
  vec2 pos = gl_FragCoord.xy / uResolution.xy;
  vec3 RED = vec3(1.0, 0.0, 0.0);
  vec3 BLUE = vec3(0.0, 0.0, 1.0);
  // x座標上の線形補間
  vec3 xlerpColor = mix(RED, BLUE, pos.x);
  outColor = vec4(xlerpColor, 1.0);
}`;window.onload=()=>{const n=new i("gl-canvas"),t=n.canvas,o=n.gl;if(!t||!o)return;const r=()=>{n.autoResize(()=>n.fitScreen()),o.clearColor(0,0,0,1),o.clearDepth(1);const e=new l(o,u,f),s=[],a=["uResolution"];e.load(s,a),new v(o,e).resolution()},c=()=>{o.viewport(0,0,o.canvas.width,o.canvas.height),o.clear(o.COLOR_BUFFER_BIT|o.DEPTH_BUFFER_BIT),o.drawArrays(o.TRIANGLE_FAN,0,3)};(()=>{r(),c()})()};
