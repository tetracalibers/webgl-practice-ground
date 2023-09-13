#version 300 es

precision highp float;

uniform sampler2D uOriginal;
uniform sampler2D uVoronoi;

uniform float uMixingRatio;

in vec2 vTextureCoords;

out vec4 fragColor;

void main() {
  vec2 uv = vec2(vTextureCoords.x, 1.0 - vTextureCoords.y);

  vec3 original = texture(uOriginal, uv).rgb;
  vec2 center = texture(uVoronoi, uv).xy;
  vec3 voronoi = texture(uOriginal, center).rgb;

  fragColor = vec4(mix(original, voronoi, uMixingRatio), 1.0);
}