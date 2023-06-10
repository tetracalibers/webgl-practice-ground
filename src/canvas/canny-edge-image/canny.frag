#version 300 es

precision highp float;

uniform sampler2D uTexture0;
uniform float uThreshold;

in vec2 vTextureCoords;

out vec4 fragColor;

void main() {
  vec2 texCoord = vec2(vTextureCoords.x, 1.0 - vTextureCoords.y);
  
  vec3 center = texture(uTexture0, texCoord).rgb;
  
  vec3 forward = texture(uTexture0, texCoord + center.xy).rgb;
  vec3 backward = texture(uTexture0, texCoord - center.xy).rgb;
  
  vec3 edge = vec3(0.5);
  vec3 nonEdge = vec3(1.0);
  
  vec3 binary = center.z > forward.z && center.z > backward.z
    ? edge
    : nonEdge;
  
  binary = center.z < uThreshold ? nonEdge : binary;

  fragColor = vec4(binary, 1.0);
}