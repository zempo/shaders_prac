#version 330
#ifdef GL_ES
precision mediump float;
#endif 

uniform vec2 iResolution;
uniform float iTime;
uniform sampler2D iChannel0;

// out vec4 FragColor;

// --- Noise function adapted from IQ
float hash3(vec3 p) {
    return fract(sin(dot(p, vec3(1.0, 57.0, -13.7))) * 4375.5453);
}

float noise3(vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);  // Smooth interpolation

    return mix(mix(mix(hash3(p + vec3(0.0, 0.0, 0.0)), hash3(p + vec3(1.0, 0.0, 0.0)), f.x),
                   mix(hash3(p + vec3(0.0, 1.0, 0.0)), hash3(p + vec3(1.0, 1.0, 0.0)), f.x), f.y),
               mix(mix(hash3(p + vec3(0.0, 0.0, 1.0)), hash3(p + vec3(1.0, 0.0, 1.0)), f.x),
                   mix(hash3(p + vec3(0.0, 1.0, 1.0)), hash3(p + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);
}

#define noise(x) (noise3(x) + noise3(x + vec3(11.5))) / 2.0  // Improved pseudoperlin

void main() {
    vec2 U = gl_FragCoord.xy;
    vec2 R = iResolution;

    // Sample texture from iChannel0
    vec4 baseTexture = texture(iChannel0, U / iResolution.xy);

    // Generate procedural noise and isovalues
    float n = noise(vec3(U * 8.0 / R.y, 0.1 * iTime));
    float v = sin(6.28318 * 10.0 * n);
    float t = iTime;

    v = smoothstep(1.0, 0.0, 0.5 * abs(v) / fwidth(v));

    // Combine texture with noise effect
    vec4 color = mix(exp(-33.0 / R.y) * baseTexture, 0.5 + 0.5 * sin(12.0 * n + vec4(0.0, 2.1, -2.1, 0.0)), v);

    FragColor = color;
}
