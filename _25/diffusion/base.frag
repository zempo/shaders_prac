#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.141592653589793
#define TAU 6.283185307179586

// Simulated fixed input

uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_mouse;

const bool u_renderpass = false;
const int u_frame = 60;

uniform sampler2D u_noise;
uniform sampler2D u_buffer;

// Gray-Scott constants
vec2 Diffusion = vec2(0.0805, 0.02031);
float k = 0.075;
float f = 0.080;
float timeStep = 0.4;

float starSDF(vec2 st, int V, float s) {
    float a = atan(st.y, st.x) / TAU;
    float seg = a * float(V);
    a = ((floor(seg) + 0.5) / float(V) + mix(s, -s, step(0.5, fract(seg)))) * TAU;
    return abs(dot(vec2(cos(a), sin(a)), st));
}

vec4 laplacian9(vec2 position, vec4 offset) {
    return
        0.5 * texture2D(u_buffer, position - offset.xy) +
        texture2D(u_buffer, position - offset.zy) +
        0.5 * texture2D(u_buffer, position - offset.wy) +
        texture2D(u_buffer, position - offset.xz) -
        6.0 * texture2D(u_buffer, position) +
        texture2D(u_buffer, position + offset.xz) +
        0.5 * texture2D(u_buffer, position + offset.wy) +
        texture2D(u_buffer, position + offset.zy) +
        0.5 * texture2D(u_buffer, position + offset.xy);
}

void main() {
  float zoom = 1.0;
  vec2 uv = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  // vec2 translate = vec2((sin(u_time / 1.0) * 0.25),0.0);
  // uv += translate;
    // vec2 uv = (gl_FragCoord.xy - .75 * u_resolution) / min(u_resolution.y, u_resolution.x);
    // vec2 uv = zoom * (gl_FragCoord.xy / u_resolution.xy);
    vec2 sample = gl_FragCoord.xy / u_resolution;

    float rot = -18.0 * PI / 180.0;
    float field = starSDF(uv * 1.5 * mat2(cos(rot), -sin(rot), sin(rot), cos(rot)), 5, 0.09);
    float star = smoothstep(0.225, 0.04, field);
    star += smoothstep(0.43, 0.45, length(uv)) * 0.9;
    star = clamp(star, 0.0, 1.0);

    Diffusion = mix(Diffusion, vec2(0.085, 0.04531), star);
    k = mix(k, 0.064, star);
    f = mix(f, 0.086, star);
    timeStep = mix(timeStep, 1.7, star);

    float outerDiff = clamp(length(uv * 1.1) - 0.4, 0.0, 1.0);
    Diffusion = mix(Diffusion, vec2(0.105, 0.05531), outerDiff);
    k = mix(k, 0.104, outerDiff);
    f = mix(f, 0.070, outerDiff);

    vec3 offset = vec3(1.0 / u_resolution, 0.0);
    vec4 v = texture2D(u_buffer, sample);

    if (u_renderpass) {
        if (u_frame > 3) {
            vec2 lv = laplacian9(sample, vec4(offset, -offset.x)).xy;
            float xyy = v.x * v.y * v.y;
            k -= lv.x * 0.09;
            vec2 dV = vec2(Diffusion.x * lv.x - xyy + f * (1.0 - v.x),
                           Diffusion.y * lv.y + xyy - (f + k) * v.y);
            v.xy += timeStep * dV;
        } else {
            v = vec4(smoothstep(0.05, 0.0, field) * 10.0);
        }

        if (u_mouse.z == 1.0) {
            float shade = smoothstep(0.1, 0.015, length(u_mouse.xy - uv));
            v.x -= shade * 0.919;
        }

        gl_FragColor = vec4(v);
    } else {
        if (u_frame > 20) {
            float c = smoothstep(0.5, 0.35, v.x);
            c += (1.0 - v.x) * 1.5;
            c *= 0.5;
            gl_FragColor = mix(vec4(0.1, 0.2, 0.4, 1.0), vec4(0.0, 0.05, 0.05, 1.0), clamp(length(uv), 0.0, 1.0));
            gl_FragColor += vec4(c);
        }
    }
}
