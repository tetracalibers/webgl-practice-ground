#version 300 es

precision highp float;

uniform sampler2D uTexture0;
uniform sampler2D uTexture1;

in vec4 vColor;
in vec2 vTextureCoords;

out vec4 fragColor;

void main() {
  vec4 smpColor0 = texture(uTexture0, vTextureCoords);
  vec4 smpColor1 = texture(uTexture1, vTextureCoords);
  
  fragColor = vColor * smpColor0 * smpColor1;
}