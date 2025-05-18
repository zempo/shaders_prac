#version 460

#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_buffer0;
uniform sampler2D u_buffer1;
uniform vec2 u_resolution;
uniform float u_time;
// uniform vec2 u_mouse;
uniform vec2 u_mouse;

uniform float u_pencilStroke = 0.01;
uniform float u_pencilPressure = 0.8;
uniform float u_pencilSoftness = 0.001;
uniform vec3 u_pencilColor = vec3(0.1, 0.1, 0.1);
uniform bool u_fade = true;

out vec4 FragColor;

const float PI = 3.1415926535897932384626433832795;
const float TAU = PI * 2.;
const float E = 2.71828182845904523536028747135266;
const float PHI = 1.61803398874989484820458683436564;
const float GAMMA = 0.57721566490153286060651209008240243;
const float GOLDEN_RATIO = 1.61803398874989484820458683436564;

vec3 pal( float t, vec3 a, vec3 b, vec3 c, vec3 d) {
	return a + b * cos(TAU * (c * t + d));
	}

float rand(vec2 co, float seed) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) + seed) * 43758.5453;
}

vec3 paperTexture(vec2 uv) {
   
    // Base paper color (off-white)
    vec3 c_0 = vec3(0.96, 0.96, 0.93);

    // marbling pattern
    float p1 = (uv.y * 0.5 + 0.5) + length(uv + log(max(uv, 1.1)));

    // Base paper colors (warm off-whites to subtle yellows)
    vec3 baseColor = pal(
        p1, // Vertical gradient
	vec3(0.96, 0.96, 0.93),
	vec3(0.05, 0.03, 0.02),
	vec3(.300, .300, .201),
	vec3(1.00, 1.00, 0.00)
    ); 

  vec3 c_paper = mix(baseColor, c_0, p1);

  // texture
  float noise = rand(uv,.0);
  c_paper = mix(c_paper, vec3(noise * 0.2 + 0.8), .1);

  // fiber
  float fiber = smoothstep(.9, 1., rand(uv*10.,.0));
  c_paper = mix(c_paper, vec3(0.9), fiber * 0.32);

  // add random speckles (like with the processing version)
  float speckle = step(.999, rand(uv,.1));
  c_paper = mix(c_paper, vec3(rand(uv + .1,0.)), speckle * .31);

  return c_paper;
}

// Helper: draw a smooth line segment between p0 and p1 at fragment position p
float lineSegment(vec2 p, vec2 p0, vec2 p1, float width) {
    vec2 pa = p - p0;
    vec2 ba = p1 - p0;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    float d = length(pa - ba * h);
    return smoothstep(width, 0.0, d);
}

// Signed distance function for a teardrop shape centered at the origin
// uv: the vector from fragment position to the brush center, normalized
float teardropSDF(vec2 uv) {
    // Parameters controlling the shape
    float stretch = 1.8;  // stretch along y-axis
    float offset = 0.3;   // vertical offset of the ellipse center

    // Shift the uv down by offset (so the "tip" is at origin)
    uv.y += offset;

    // Scale y to stretch ellipse
    uv.y /= stretch;

    // Distance to ellipse boundary (circle radius 1)
    float d = length(uv) - 1.0;

    // Now compress the bottom part for the tail effect
    if (uv.y < 0.0) {
        // Pull bottom inwards for tail
        d += 0.5 * (-uv.y);
    }

    return d;
}

#ifdef BUFFER_0
void main() {
    float zoom = 1.0;
    vec2 uv = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);

    // Read previous pencil trail
    float previous = texture(u_buffer1, uv).r;

    // ?? circle pen Distance from mouse 
    float dist = length(uv - u_mouse / u_resolution);
    float stroke = smoothstep(u_pencilStroke, 0., dist);  // soft round brush

        // Add pencil texture and pressure variation
    stroke *= 0.7 + 0.3 * rand(uv * 100.0 + u_time, 0.0);
    stroke *= u_pencilPressure;
    

    // Accumulate stroke onto previous trail
    // float pencil = clamp(previous + stroke * (1.0 - previous), 0.0, 1.0);
    // Combine with previous strokes (maximum preserves overlapping strokes)
    float pencil = max(previous, stroke);

    // Slight decay over time
    pencil *= 0.995;
    
    FragColor = vec4(pencil, 0.0, 0.0, 1.0);
}
#elif defined(BUFFER_1)
void main() {
    float zoom = 1.0;
    vec2 uv = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
    FragColor = texture(u_buffer0, uv);
}
#else
void main() {
    // vec2 uv = gl_FragCoord.xy / u_resolution;
    float zoom = 1.0;
    vec2 uv = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
    // vec2 translate = vec2((sin(u_time / 1.0) * 0.25),0.0);
    // uv += translate;
    float pencil = texture(u_buffer1, uv).r;
    vec3 paper = paperTexture(uv);
    vec3 pencilColor = vec3(0.1);
    vec3 result = mix(paper, pencilColor * paper, pencil);
    FragColor = vec4(result, 1.0);
}
#endif
