#version 300 es

precision highp float;

const float redScale   = 0.298912;
const float greenScale = 0.586611;
const float blueScale  = 0.114478;
const vec3 monochromeScale = vec3(redScale, greenScale, blueScale);

uniform sampler2D uTexture0;

in vec2 vTextureCoords;

out vec4 fragColor;

void main() {
  vec4 smpColor = texture(uTexture0, vTextureCoords);
  
  float grayColor = dot(smpColor.rgb, monochromeScale);
  smpColor = vec4(vec3(grayColor), 1.0);

  fragColor = smpColor;
}