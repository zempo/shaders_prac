#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
const float PI = 3.14159265359;
const float TAU = 6.28318530718;

// Converts HSV to RGB
vec3 hsv2rgb(vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0),
                              6.0) - 3.0) - 1.0,
                     0.0,
                     1.0);
    rgb = rgb * rgb * (3.0 - 2.0 * rgb); // Smoothstep feel
    return c.z * mix(vec3(1.0), rgb, c.y);
}

// Random number generator
float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Noise-based random position
vec2 randomPos(float i) {
    float a = rand(vec2(i, 0.1)) * 6.2831;
    float r = rand(vec2(i, 0.2)) * 0.9 + 0.1;
    return vec2(cos(a), sin(a)) * r;
}

// Random 2D vector based on index
vec2 randomVec2(float i) {
    return vec2(
        rand(vec2(i, 0.1)),
        rand(vec2(i, 0.6))
    ) * 2.0 - 1.0;
}

vec3 c_palette( float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(TAU * (c * t + d));
}

mat2 rotate(float angle){
  return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    float rate0 = u_time;
    float rate1 = u_time * 0.2;
    float rate2 = u_time * 0.0001;

    // vec3 color = vec3(0.0, 0.0, 0.0);
    vec3 color = c_palette(
        length(uv),
        vec3(0.5,0.5,0.5),vec3(0.5,0.5,0.5),vec3(1.0,1.0,1.0),vec3(0.0,0.10,0.20)
        );
    color = clamp(color, 0.0, .15);
    // vec3 cp1 = vec3(0.0, 0.0, 0.0);

    const int CIRCLES = 100;

    for (int i = 0; i < CIRCLES; ++i) {
        float fi = float(i);

        // Base position
        vec2 base = vec2(
            rand(vec2(fi, 0.3)) - 0.5,
            rand(vec2(fi, 0.4)) - 0.5
        ) * 1.8;

        // Movement vector
        vec2 dir = randomVec2(fi);
        vec2 offset = dir * sin(u_time * 0.32 + fi); // subtle oscillation

        vec2 center = base + offset;

        float radius = 0.25 * rand(vec2(fi, 0.5)) + 0.05;
        float subdiv = 6.0 + rand(vec2(fi, radius));
        vec2 uv_div = fract(uv * subdiv * rand(vec2(fi, 0.3)) + cos(rate1) + sin(rate1)) - 0.5;
        uv = rotate(PI*rate2) * uv;
        float dist = length(uv_div - center) / radius;
        float dist2 = length(uv - center) / radius;

        // Concentric ring effect
        // float ring = 0.7 + 0.3 * sin(dist * 40.0);
        float ring = 0.7 + 0.3 * sin(dist * 100.0);
        float ring2 = 0.7 + 0.3 * sin(dist2 * 100.0);
        // float fade = exp(-dist * 5.0);
        float fade = exp(-dist * 3.0);
        float fade2 = exp(-dist * 3.0);

        // Circle color varies by index
        float hue = mod(fi / float(CIRCLES) + rate0 * 0.02, 1.0);
        float hue2 = mod(fi * 2.0 / float(CIRCLES) + rate0 * 0.02, 1.0);
        vec3 c = hsv2rgb(vec3(hue, 1.0, 1.0)) * ring * fade;
        vec3 c2 = hsv2rgb(vec3(hue, hue, 1.0)) * ring2 * fade2;

        vec3 cp1 = c_palette(
        dist,
        vec3(0.5,0.5,0.5),vec3(0.5,0.5,0.5),vec3(1.0,1.0,1.0),vec3(0.0,0.10,0.20)
        );

        color += c * cp1 * c2;
        color += c2;
        // color *= cp1;
    }

    color = clamp(color, 0.0, 1.0);
    gl_FragColor = vec4(color, 1.0);
}
