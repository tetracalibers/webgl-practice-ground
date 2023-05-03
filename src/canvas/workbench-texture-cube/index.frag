#version 300 es

precision mediump float;

in vec4 vColor;
in vec2 vTextureCoords;

uniform sampler2D uTexture0;

out vec4 fragColor;

void main() {
  fragColor = vColor * texture(uTexture0, vTextureCoords);
}