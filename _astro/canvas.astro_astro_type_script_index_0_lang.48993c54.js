import{S as a,P as l}from"./program.2ef84f69.js";import{U as v}from"./uniform-reflect.63d9f660.js";const u=`#version 300 es

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
  vec3 GREEN = vec3(0.0, 1.0, 0.0);
  vec3 BLUE = vec3(0.0, 0.0, 1.0);
  vec3 YELLOW = vec3(1.0, 1.0, 0.0);
  vec3[4] colors4 = vec3[](RED, BLUE, GREEN, YELLOW);
  
  vec3 bilerpColor = mix(mix(colors4[0], colors4[1], pos.x), mix(colors4[2], colors4[3], pos.x), pos.y);
  
  outColor = vec4(bilerpColor, 1.0);
}`;window.onload=()=>{const n=new a("gl-canvas"),c=n.canvas,o=n.gl;if(!c||!o)return;const r=()=>{n.autoResize(()=>n.fitScreen()),o.clearColor(0,0,0,1),o.clearDepth(1);const e=new l(o,u,f),s=[],i=["uResolution"];e.load(s,i),new v(o,e).resolution()},t=()=>{o.viewport(0,0,o.canvas.width,o.canvas.height),o.clear(o.COLOR_BUFFER_BIT|o.DEPTH_BUFFER_BIT),o.drawArrays(o.TRIANGLE_FAN,0,3)};(()=>{r(),t()})()};
