import{S as m,P as u}from"./program.2ef84f69.js";import{U as v}from"./uniform-reflect.63d9f660.js";import{T as p}from"./timer.1ee66154.js";import{C as g}from"./clock.75804a61.js";const d=`#version 300 es

// @see https://gist.github.com/strangerintheq/27b8fc4e53432d8b9284364713ce8608
void main() {
  float x = float((gl_VertexID & 1) << 2);
  float y = float((gl_VertexID & 2) << 1);
  gl_Position = vec4(x - 1.0, y - 1.0, 0, 1);
}`,x=`#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

uniform vec2 uResolution;
uniform float uTime;

out vec4 outColor;

// 2Dのレガシー乱数
// * xyは正規化された座標
float fractSin21(vec2 xy) {
  // 正規化したフラグメント座標に内積による比重を与えて足し、
  // そのsin値に大きな値をかけて小数点をとる
  return fract(sin(dot(xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  vec2 pos = gl_FragCoord.xy;
  
  // フラグメント座標を時間変動させる
  pos += floor(60.0 * uTime);
  
  // フラグメント座標を正規化
  pos = pos.xy / uResolution.xy;
  
  outColor = vec4(vec3(fractSin21(pos.xy)), 1.0);
}`;window.onload=()=>{const o=new m("gl-canvas"),s=o.canvas,n=o.gl;if(!s||!n)return;let e,t,r;const a=()=>{o.autoResize(()=>o.fitScreen()),n.clearColor(0,0,0,1),n.clearDepth(1);const i=new u(n,d,x),l=[],f=["uResolution","uTime"];i.load(l,f),e=new v(n,i),r=new g,t=new p,t.start()},c=()=>{n.viewport(0,0,n.canvas.width,n.canvas.height),n.clear(n.COLOR_BUFFER_BIT|n.DEPTH_BUFFER_BIT),e.time(t.elapsed),e.resolution(),n.drawArrays(n.TRIANGLE_FAN,0,3)};(()=>{a(),r.on("tick",c)})()};
