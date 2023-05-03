#version 300 es

precision highp float;

uniform sampler2D uTexture0;
uniform sampler2D uTexture1;
uniform int uBlendMode;

in vec2 vTextureCoords;

out vec4 fragColor;

void main() {
  vec3 finalColor = vec3(0.0);
  
  vec2 texCoord = vec2(vTextureCoords.x, 1.0 - vTextureCoords.y);
  
  vec4 texture0 = texture(uTexture0, texCoord);
  vec4 texture1 = texture(uTexture1, texCoord);
  
  vec3 background = texture0.rgb;
  vec3 foreground = texture1.rgb;
  
  float bgAlpha = texture0.a;
  float fgAlpha = texture1.a;
  
  if (uBlendMode == 0) {
    // add
    finalColor = background + foreground;
  } else if (uBlendMode == 1) {
    // subtract
    finalColor = background - foreground;
  } else if (uBlendMode == 2) {
    // difference
    finalColor = abs(background - foreground);
  } else if (uBlendMode == 3) {
    // lighten
    finalColor = max(background, foreground);
  } else if (uBlendMode == 4) {
    // darken
    finalColor = min(background, foreground);
  } else if (uBlendMode == 5) {
    // multiply
    finalColor = background * foreground;
  } else if (uBlendMode == 6) {
    // screen
    finalColor = 1.0 - (1.0 - background) * (1.0 - foreground);
  } else if (uBlendMode == 7) {
    // overlay
    // 明度brightnessが0.5以下かどうかで分岐
    float brightness = max(background.r, max(background.g, background.b));
    finalColor = mix(
      2.0 * background * foreground,
      1.0 - 2.0 * (1.0 - background) * (1.0 - foreground),
      step(0.5, brightness)
    );
  } else if (uBlendMode == 8) {
    // color-dodge
    finalColor = background / (1.0 - foreground);
  } else if (uBlendMode == 9) {
    // color-burn
    finalColor = 1.0 - (1.0 - background) / foreground;
  }
  
  fragColor = vec4(mix(background, finalColor, fgAlpha), bgAlpha);
}