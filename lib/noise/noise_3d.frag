#version 460

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
out vec4 FragColor;
uniform sampler2D iChannel0; // 2D texture sampler, equivalent to iChannel0


const float PI = 3.14159265359;
float mkPoly(vec2 position, float radius, float sides){
    position = position * 2.0 - 1.0;
    float angle = atan(position.x, position.y);
    float slice = PI * 2.0 / sides;
    return step(radius, cos(floor(0.5 + angle / slice) * slice - angle) * length(position));
}

float hash3(vec3 p) {
    return fract(sin(1000.0 * dot(p, vec3(1.0, 57.0, -13.7))) * 4375.5453);
}

float noise3(vec3 x) {
    vec3 p = floor(x);      // Integer part
    vec3 f = fract(x);      // Fractional part

    f = f * f * (3.0 - 2.0 * f); // Smooth interpolation

    // Trilinear interpolation of random values at cube corners
    return mix(
        mix(
            mix(hash3(p + vec3(0.0, 0.0, 0.0)), hash3(p + vec3(1.0, 0.0, 0.0)), f.x),
            mix(hash3(p + vec3(0.0, 1.0, 0.0)), hash3(p + vec3(1.0, 1.0, 0.0)), f.x), f.y
        ),
        mix(
            mix(hash3(p + vec3(0.0, 0.0, 1.0)), hash3(p + vec3(1.0, 0.0, 1.0)), f.x),
            mix(hash3(p + vec3(0.0, 1.0, 1.0)), hash3(p + vec3(1.0, 1.0, 1.0)), f.x), f.y
        ), f.z
    );
}

float noise(vec3 x) {
    return (noise3(x) + noise3(x + 11.5)) / 2.0;
}

void main(){
    // https://www.shadertoy.com/view/ldfczS (original)
    // https://www.shadertoy.com/view/Mcy3WW (fork)
    float zoomV = 700.0;
    vec2 uv = zoomV * ((gl_FragCoord.xy - (u_resolution.xy * 1.0)) / u_resolution.y);

    // vec2 uv = 200.0 * FragColor.xy;

    // Generate noise and sinusoidal value based on time
    float n = noise(vec3(uv * 8.0 / u_resolution.y, 0.05 * u_time));
    float line_amnt = 26.28;
    float warble = (sin(u_time / 25.0) + 4.0);
    float v = sin(line_amnt * warble * n);
    float t = u_time;

    float color_seed = tan(u_time) + 5.0; // default rainbow 12.0
    
    // Smooth the value for anti-aliasing
    v = smoothstep(1.0, 0.0, 0.5 * abs(v) / fwidth(v));

    // Sample texture and combine with calculated noise and sine values
    vec4 texColor = texture(iChannel0, (uv + vec2(1.0, sin(t))) / u_resolution);
    FragColor = mix(
        exp(-33.0 / uv.y) * texColor,
        0.5 + 0.5 * sin(color_seed * n + vec4(0.0, 2.1, -2.1, 0.0)),
        v
    );
    FragColor += texture( iChannel0, 10.0 * ((gl_FragCoord.xy - (u_resolution.xy * 1.0)) / u_resolution.y) / u_resolution.xy);
}