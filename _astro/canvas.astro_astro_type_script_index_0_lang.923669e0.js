import{S as l,P as f}from"./program.2ef84f69.js";import{U as v}from"./uniform-reflect.63d9f660.js";const g=`#version 300 es

// @see https://gist.github.com/strangerintheq/27b8fc4e53432d8b9284364713ce8608
void main() {
  float x = float((gl_VertexID & 1) << 2);
  float y = float((gl_VertexID & 2) << 1);
  gl_Position = vec4(x - 1.0, y - 1.0, 0, 1);
}`,u=`#version 300 es

// 全ての浮動小数点型の変数に高い精度を指定
precision highp float;

uniform vec2 uResolution;

out vec4 outColor;

void main() {
  // フラグメント座標を正規化
  // * 割合なので、[0, 1]の範囲になる
  vec2 xy = gl_FragCoord.xy / uResolution.xy;
  
  // float left = step(0.1, xy.x); // x < 0.1 なら黒 = 0.0
  // float bottom = step(0.1, xy.y); // y < 0.1 なら黒 = 0.0
  // ↑を合わせて書いた
  vec2 bottom_left = step(vec2(0.1), xy);
  
  // xy座標を反転（紙をひっくり返すように）
  // 原点が左下[0, 0]から右上[1, 1]になる
  xy = 1.0 - xy;
  
  // ひっくり返した上で同様に辺を描く
  vec2 top_right = step(vec2(0.1), xy);
  
  // 掛け算 = AND演算
  // * 両方の値が 1.0 だった場合にのみ 1.0
  // * つまり、左辺でも底辺でもない箇所のみ白で塗りつぶす（それ以外は黒）
  float color = bottom_left.x * bottom_left.y;
  // 同様に
  color *= top_right.x * top_right.y;
  
  outColor = vec4(vec3(color), 1.0);
}
`;window.onload=()=>{const o=new l("gl-canvas"),r=o.canvas,n=o.gl;if(!r||!n)return;let t;const c=()=>{o.autoResize(()=>o.fitScreen()),n.clearColor(0,0,0,1),n.clearDepth(1);const e=new f(n,g,u),a=[],i=["uResolution"];e.load(a,i),t=new v(n,e)},s=()=>{n.viewport(0,0,n.canvas.width,n.canvas.height),n.clear(n.COLOR_BUFFER_BIT|n.DEPTH_BUFFER_BIT),t.resolution(),n.drawArrays(n.TRIANGLE_FAN,0,3)};(()=>{c(),s()})()};
