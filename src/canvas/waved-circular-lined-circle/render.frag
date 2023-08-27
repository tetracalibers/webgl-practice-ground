#version 300 es

precision highp float;

in float vTheta;

out vec4 fragColor;

uniform float uTime;

// @see https://iquilezles.org/articles/palettes/
vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(6.28318 * (c * t + d));
}

void main(){
  
  vec3 color = palette(
    mod(vTheta,7.0),
    vec3(0.5, 0.5, 0.5),
    vec3(0.5, 0.5, 0.5),
    vec3(1.0, 1.0, 1.0),
    vec3(0.0, 0.33, 0.67)
  );
  
  fragColor = vec4(color, 1.0);
}