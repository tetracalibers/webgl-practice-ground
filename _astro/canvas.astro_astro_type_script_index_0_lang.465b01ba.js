import{S as f,P as u}from"./program.2ef84f69.js";import{U as g}from"./uniform-reflect.63d9f660.js";const m=`#version 300 es

// @see https://gist.github.com/strangerintheq/27b8fc4e53432d8b9284364713ce8608
void main() {
  float x = float((gl_VertexID & 1) << 2);
  float y = float((gl_VertexID & 2) << 1);
  gl_Position = vec4(x - 1.0, y - 1.0, 0, 1);
}`,v=`#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

uniform vec2 uResolution;

out vec4 outColor;

// 円 f(x, y) = length(xy, center) - radius
float circle(vec2 xy, vec2 center, float radius) {
  vec2 fromCenter = xy - center;
  // dot(c, c) = ||c|| * ||c|| * cos(0) = ||c||^2 = length(c)^2
  // pow(dot(c, c), 0.5) = length(c)^2^0.5 = length(c)^(2 * 0.5) = length(c)
  return pow(dot(fromCenter, fromCenter), 0.5) - radius;
}

// 円周
vec3 circumference(float circle) {
  // f(x, y) = 0を満たすのが円周
  // それだけだと線が細すぎるので、-0.005 < f(x, y) < 0.005を円周として黒塗りする
  return abs(circle) < 0.005 ? vec3(0.0) : vec3(1.0);
}

void main() {
  // ビューポートの中心を原点として [0, 1] -> [-1, 1] にスケール
  // @see https://docs.google.com/presentation/d/12RrqyAkFanKmfL96ZHvhDCozE-_rKFPlU1YVwej4_bc/htmlpresent
  // * min = x なら、 2.0 * gl_FragCoord.xy / x - [1, y / x]
  // * min = y なら、 2.0 * gl_FragCoord.xy / y - [x / y, 1]
  vec2 pos = (2.0 * gl_FragCoord.xy - uResolution.xy) / min(uResolution.x, uResolution.y);
  
  outColor.rgb = circumference(circle(pos, vec2(0.0), 1.0));
  outColor.a = 1.0;
}`;window.onload=()=>{const e=new f("gl-canvas"),c=e.canvas,n=e.gl;if(!c||!n)return;let o;const s=()=>{e.fitScreen(),t()},i=()=>{e.fitScreen(),n.clearColor(0,0,0,1),n.clearDepth(1);const r=new u(n,m,v),a=[],l=["uResolution"];r.load(a,l),o=new g(n,r),e.onResize=s},t=()=>{n.viewport(0,0,n.canvas.width,n.canvas.height),n.clear(n.COLOR_BUFFER_BIT|n.DEPTH_BUFFER_BIT),o.resolution(),n.drawArrays(n.TRIANGLE_FAN,0,3)};(()=>{i(),t()})()};
