import{S as v,P as m}from"./program.2ef84f69.js";import{U as d}from"./uniform-reflect.63d9f660.js";import{C as g}from"./clock.75804a61.js";import{M as p}from"./mouse-coords.75a3fe45.js";const x=`#version 300 es

// @see https://gist.github.com/strangerintheq/27b8fc4e53432d8b9284364713ce8608
void main() {
  float x = float((gl_VertexID & 1) << 2);
  float y = float((gl_VertexID & 2) << 1);
  gl_Position = vec4(x - 1.0, y - 1.0, 0, 1);
}`,_=`#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

uniform vec2 uResolution;
uniform vec2 uMouse;

out vec4 outColor;

// 円周率
const float PI = 3.1415926;

// マンハッタン距離 |t_x - f_x| + |t_y - f_y|
float mdistance(vec2 from, vec2 to) {
  vec2 diff = abs(to - from);
  // diff.x * 1.0 + diff.y * 1.0 = diff.x + diff.y
  return dot(diff, vec2(1.0));
}

// 円
float circle(vec2 point, vec2 center, float radius) {
  return mdistance(point, center) - radius;
}

// 等高線
vec3 contour(float v, float interval) {
  return abs(v) < 0.01
    ? vec3(0.0) // 等高線を黒で描画
    : mod(v, interval) < 0.01
      ? vec3(1.0) // 等間隔の値の等高線を白で描画
      : mix(vec3(1.0, 0.0, 1.0), vec3(0.0, 1.0, 1.0), atan(v) / PI + 0.5); // 等高線以外は中間色で描画
}

void main() {
  // ビューポートの中心を原点としてスケール
  vec2 pos = (2.0 * gl_FragCoord.xy - uResolution.xy) / min(uResolution.x, uResolution.y);
  
  // 等高線を描く値の間隔
  float interval = 0.1;
  
  // 等高線の描画
  outColor.rgb = vec3(contour(circle(pos, vec2(0.0), 0.7), interval));
  outColor.a = 1.0;
}
`;window.onload=()=>{const o=new v("gl-canvas"),t=o.canvas,n=o.gl;if(!t||!n)return;let r,e,c;const a=()=>{o.fitScreen(),n.clearColor(0,0,0,1),n.clearDepth(1);const s=new m(n,x,_),f=[],u=["uResolution","uMouse"];s.load(f,u),e=new d(n,s),r=new g,c=new p(t),o.onResize=l},i=()=>{n.viewport(0,0,n.canvas.width,n.canvas.height),n.clear(n.COLOR_BUFFER_BIT|n.DEPTH_BUFFER_BIT),e.resolution(),e.mouse(c.xy),n.drawArrays(n.TRIANGLE_FAN,0,3)},l=()=>{o.fitScreen(),i()};(()=>{a(),r.on("tick",i)})()};
