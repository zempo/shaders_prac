#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;


// Convert HSV to RGB
vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}


float fieldAngle(vec2 gridUV) {
    // Angle changes with Y — you can make this more interesting later
    return mix(0.0, 3.14159, gridUV.y * 0.5 + 0.5); // map [-1,1] to [0,1]
}

vec3 drawCurve(vec2 uv) {
    float stepLength = 0.01; // smaller due to normalized UV space
    int steps = 400;

    float gridSize = 0.02; // distance between grid points (in UV space)

    // Grid bounds in UV space: e.g., [-1.0, 1.0]
    vec2 gridMin = vec2(-1.0);
    vec2 gridMax = vec2(1.0);
    vec2 gridExtent = gridMax - gridMin;

    // Start position (near center-top)
    vec2 pos = vec2(0.0, -0.75);

    float minDist = 1000.0;
        float finalAngle = 0.0;

    for (int i = 0; i < 400; i++) {
        if (i >= steps) break;

        // Grid-relative UV (normalized to [0,1] in grid space)
        vec2 gridUV = (pos - gridMin) / gridExtent;

        float angle = fieldAngle(gridUV);
        vec2 dir = vec2(cos(angle), sin(angle));
        pos += dir * stepLength;

        float d = length(uv - pos);
        // minDist = min(minDist, d);
                if (d < minDist) {
            minDist = d;
            finalAngle = angle;
        }
    }

    float glow = smoothstep(0.01, 0.0, minDist);
    float hue = finalAngle / 3.14159; // Normalize to [0,1]
    vec3 color = hsv2rgb(vec3(hue, 0.8, 1.0));

    return color * glow;
}

void main() {
    float zoom = 1.0;
    vec2 uv = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);

    vec3 col = drawCurve(uv);
    gl_FragColor = vec4(col, 1.0);
}
