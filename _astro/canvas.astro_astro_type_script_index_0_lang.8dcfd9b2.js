import{S as v,P as u}from"./program.2ef84f69.js";import{U as f}from"./uniform-reflect.63d9f660.js";const g=`#version 300 es

// @see https://gist.github.com/strangerintheq/27b8fc4e53432d8b9284364713ce8608
void main() {
  float x = float((gl_VertexID & 1) << 2);
  float y = float((gl_VertexID & 2) << 1);
  gl_Position = vec4(x - 1.0, y - 1.0, 0, 1);
}`,m=`#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

uniform vec2 uResolution;

out vec4 outColor;

// 円周率
const float PI = 3.1415926;

// centerを中心とした、center + distを頂点とする矩形
float rect(vec2 xy, vec2 center, vec2 dist) {
  // xyを中心からの距離に変換
  vec2 point = abs(xy - center);
  return length(max(point - dist, vec2(0.0))) + min(max(point.x - dist.x, point.y - dist.y), 0.0);
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
  outColor.rgb = vec3(contour(rect(pos, vec2(0.0), vec2(0.5)), interval));
  outColor.a = 1.0;
}
`;window.onload=()=>{const e=new v("gl-canvas"),c=e.canvas,n=e.gl;if(!c||!n)return;let o;const i=()=>{e.fitScreen(),n.clearColor(0,0,0,1),n.clearDepth(1);const r=new u(n,g,m),a=[],l=["uResolution","uMouse"];r.load(a,l),o=new f(n,r),e.onResize=s},t=()=>{n.viewport(0,0,n.canvas.width,n.canvas.height),n.clear(n.COLOR_BUFFER_BIT|n.DEPTH_BUFFER_BIT),o.resolution(),n.drawArrays(n.TRIANGLE_FAN,0,3)},s=()=>{e.fitScreen(),t()};(()=>{i(),t()})()};
