#version 300 es

precision highp float;

uniform sampler2D uTexture0;

in vec2 vTextureCoords;

out vec4 fragColor;

void main() {
  vec2 texCoord = vec2(vTextureCoords.x, 1.0 - vTextureCoords.y);
  vec4 original = texture(uTexture0, texCoord);
  vec4 inversed = vec4(vec3(1.0) - original.rgb, original.a);
  
  fragColor = inversed;
}