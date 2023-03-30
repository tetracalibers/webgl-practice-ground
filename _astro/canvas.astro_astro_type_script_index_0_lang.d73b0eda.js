import{S as f,P as p}from"./program.2ef84f69.js";import{U as u}from"./uniform-reflect.63d9f660.js";import{T as v}from"./timer.1ee66154.js";import{C as g}from"./clock.75804a61.js";const h=`#version 300 es

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

void main() {
  // フラグメント座標を正規化
  vec2 pos = gl_FragCoord.xy / uResolution.xy;
  
  vec3[4] colors4 = vec3[](
    vec3(1.0, 0.0, 0.0),
    vec3(1.0, 1.0, 0.0),
    vec3(1.0, 0.0, 1.0),
    vec3(1.0, 1.0, 1.0)
  );
  
  // 階調数
  float n = 8.0;
  // 範囲の始点と終点を動かすパラメータ
  float thr = 0.25 * sin(uTime);
  
  // フラグメント座標範囲を[0, n]区間にスケール
  pos *= n;
  // フラグメント座標を滑らかに階段化
  pos = floor(pos) + smoothstep(0.25 + thr, 0.75 - thr, fract(pos));
  // フラグメント座標範囲を[0, 1]区間に正規化
  pos /= n;
  
  vec3 bilerpColor = mix(mix(colors4[0], colors4[1], pos.x), mix(colors4[2], colors4[3], pos.x), pos.y);
  
  outColor = vec4(bilerpColor, 1.0);
}`;window.onload=()=>{const n=new f("gl-canvas"),c=n.canvas,o=n.gl;if(!c||!o)return;let e,t,r;const i=()=>{n.autoResize(()=>n.fitScreen()),o.clearColor(0,0,0,1),o.clearDepth(1);const s=new p(o,h,x),l=[],m=["uResolution","uTime"];s.load(l,m),e=new u(o,s),r=new g,t=new v,t.start()},a=()=>{o.viewport(0,0,o.canvas.width,o.canvas.height),o.clear(o.COLOR_BUFFER_BIT|o.DEPTH_BUFFER_BIT),e.time(t.elapsed),e.resolution(),o.drawArrays(o.TRIANGLE_FAN,0,3)};(()=>{i(),r.on("tick",a)})()};
