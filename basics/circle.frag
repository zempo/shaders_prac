#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

float circleGEO(vec2 position, float radius){
    return step(radius, length(position - vec2(0.5)));
}

/**
* ?
*/ 
void main() {
    // vec2 uv = (gl_FragCoord.xy - (u_resolution * 0.0)) / u_resolution;
    // vec2 uv = (gl_FragCoord.xy - (u_resolution * sin(u_time))) / u_resolution;
    // vec2 uv = (gl_FragCoord.xy - (u_resolution.xy * 0.0)) / u_resolution;
    // vec2 uv = ((gl_FragCoord.xy - (u_resolution * sin(u_time) * 0.5)) / u_resolution);
    vec2 uv = (sin(u_time) * 2.5)*(gl_FragCoord.xy / u_resolution);
    // shapes, colors, fragments output here
    float circle = circleGEO(uv, 0.2);

    vec3 color = vec3(circle);
    gl_FragColor = vec4(color, 1.0);
} 