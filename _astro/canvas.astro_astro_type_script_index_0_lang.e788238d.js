import{S as m,P as u}from"./program.2ef84f69.js";import{U as g}from"./uniform-reflect.63d9f660.js";import{T as v}from"./timer.1ee66154.js";import{C as p}from"./clock.75804a61.js";const d=`#version 300 es

// @see https://gist.github.com/strangerintheq/27b8fc4e53432d8b9284364713ce8608
void main() {
  float x = float((gl_VertexID & 1) << 2);
  float y = float((gl_VertexID & 2) << 1);
  gl_Position = vec4(x - 1.0, y - 1.0, 0, 1);
}`,w=`#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

uniform vec2 uResolution;
uniform float uTime;

out vec4 outColor;

// 1Dのレガシー乱数
float fractSin11(float x) {
  // 小数点第4位以下の部分を乱数とする
  return fract(1000.0 * sin(x));
}

void main() {
  vec2 pos = gl_FragCoord.xy;
  
  // フラグメント座標を時間変動させる
  pos += floor(60.0 * uTime);
  
  outColor = vec4(vec3(fractSin11(pos.x)), 1.0);
}`;window.onload=()=>{const o=new m("gl-canvas"),a=o.canvas,n=o.gl;if(!a||!n)return;let t,e,r;const s=()=>{o.autoResize(()=>o.fitScreen()),n.clearColor(0,0,0,1),n.clearDepth(1);const i=new u(n,d,w),l=[],f=["uResolution","uTime"];i.load(l,f),t=new g(n,i),r=new p,e=new v,e.start()},c=()=>{n.viewport(0,0,n.canvas.width,n.canvas.height),n.clear(n.COLOR_BUFFER_BIT|n.DEPTH_BUFFER_BIT),t.time(e.elapsed),t.resolution(),n.drawArrays(n.TRIANGLE_FAN,0,3)};(()=>{s(),r.on("tick",c)})()};
