#version 300 es

precision highp float;

// ポスタリゼーション
vec3 posterize(vec3 color, int gradation) {
  float densityStep = 255.0 / float(gradation - 1);
  vec3 unclampColor = color * 255.0;
  vec3 stepColor = floor(unclampColor / densityStep + 0.5) * densityStep;
  return stepColor / 255.0;
}

// ----------------------------------------------------------------------

uniform sampler2D uTexture0;
uniform bool uPosterizeOn;
uniform int uGradation; // 階調数

in vec2 vTextureCoords;

out vec4 fragColor;

void main() {
  vec2 texCoord = vec2(vTextureCoords.x, 1.0 - vTextureCoords.y);
  vec4 original = texture(uTexture0, texCoord);
  
  vec3 processed = uPosterizeOn
    ? posterize(original.rgb, uGradation)
    : original.rgb;
  
  fragColor = vec4(processed, original.a);
}