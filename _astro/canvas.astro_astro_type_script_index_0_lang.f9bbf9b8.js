import{S as f,P as m}from"./program.2ef84f69.js";import{U as p}from"./uniform-reflect.63d9f660.js";import{C as g}from"./clock.75804a61.js";import{T as d}from"./timer.1ee66154.js";const w=`#version 300 es

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

// 円周率
const float PI = 3.1415926;

// Lpノルム
float lplength(vec2 xy) {
  vec2 v = abs(xy);
  // 経過時間に応じて指数を動かす
  float p = 4.0 * sin(0.5 * uTime) + 5.0;
  return pow(pow(v.x, p) + pow(v.y, p), 1.0 / p);
}

// 円
float circle(vec2 point, vec2 center, float radius) {
  return lplength(point - center) - radius;
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
`;window.onload=()=>{const o=new f("gl-canvas"),a=o.canvas,n=o.gl;if(!a||!n)return;let r,e,t;const l=()=>{o.fitScreen(),n.clearColor(0,0,0,1),n.clearDepth(1);const c=new m(n,w,x),v=[],u=["uResolution","uTime"];c.load(v,u),e=new p(n,c),r=new g,t=new d,t.start(),o.onResize=s},i=()=>{n.viewport(0,0,n.canvas.width,n.canvas.height),n.clear(n.COLOR_BUFFER_BIT|n.DEPTH_BUFFER_BIT),e.resolution(),e.time(t.elapsed),n.drawArrays(n.TRIANGLE_FAN,0,3)},s=()=>{o.fitScreen(),i()};(()=>{l(),r.on("tick",i)})()};
