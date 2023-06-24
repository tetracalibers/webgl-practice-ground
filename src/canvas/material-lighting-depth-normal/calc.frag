#version 300 es

precision highp float;

in vec4 vLightning;
in vec4 vMaterial;
in vec3 vNormal;
in float vDepth;

layout (location = 0) out vec4 fragColor0;
layout (location = 1) out vec4 fragColor1;
layout (location = 2) out vec4 fragColor2;
layout (location = 3) out vec4 fragColor3;

void main() {
  fragColor0 = vLightning;
  fragColor1 = vMaterial;
  fragColor2 = vec4((vNormal + 1.0) / 2.0, 1.0);
  fragColor3 = vec4(vec3((vDepth + 1.0) / 2.0), 1.0);
}