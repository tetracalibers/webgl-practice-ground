#version 300 es

precision highp float;

const float R_LUMINANCE = 0.298912;
const float G_LUMINANCE = 0.586611;
const float B_LUMINANCE = 0.114478;

// グレースケール化
float toMonochrome(vec3 color) {
  return dot(color, vec3(R_LUMINANCE, G_LUMINANCE, B_LUMINANCE));
}

uniform sampler2D uTexture0;
uniform float uLineScale;
uniform float uLightDirectionZ;
uniform bool uGrayScaleOn;

in vec2 vTextureCoords;

out vec4 fragColor;

void main() {
  vec2 texCoord = vec2(vTextureCoords.x, 1.0 - vTextureCoords.y);
  vec4 original = texture(uTexture0, texCoord);
  
  float gray = toMonochrome(original.rgb);
  vec3 inputColor = uGrayScaleOn ? vec3(gray) : original.rgb;
  
  // 法線ベクトルがない場合、表面法線ベクトルはビュー空間位置の偏導関数によって近似的に計算
  vec3 dx = dFdx(vec3(texCoord, 0.0));
  vec3 dy = dFdy(vec3(texCoord, 0.0));

  vec3 N = normalize(cross(dx, dy));
  N *= sign(N.z);
  vec3 L = vec3(1.0, 1.0, uLightDirectionZ);

  float diffuse = dot(N, L);
  
  vec2 scale = gl_FragCoord.xy * uLineScale;
  float wave = sin(scale.x + scale.y);
  
  float intensity = mix(0.0, 1.0, diffuse);

  vec3 outColor = inputColor * (diffuse + wave + intensity);
  
  fragColor = vec4(outColor, 1.0);
}