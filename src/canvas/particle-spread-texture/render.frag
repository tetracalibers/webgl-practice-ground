#version 300 es

precision highp float;

in vec4 vVertexColor;

out vec4 fragColor;

void main(){
  fragColor = vVertexColor;
}